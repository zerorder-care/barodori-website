#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${I18N_SCAN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

if ! command -v rg >/dev/null 2>&1; then
  echo "i18n guard failed: ripgrep (rg) is not installed." >&2
  exit 1
fi

resolve_base_ref() {
  if [[ -n "${I18N_SCAN_BASE:-}" ]]; then
    printf '%s\n' "$I18N_SCAN_BASE"
    return 0
  fi

  if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
    if git -C "$ROOT_DIR" rev-parse --verify --quiet "origin/$GITHUB_BASE_REF^{commit}" >/dev/null; then
      printf 'origin/%s\n' "$GITHUB_BASE_REF"
      return 0
    fi

    if git -C "$ROOT_DIR" rev-parse --verify --quiet "$GITHUB_BASE_REF^{commit}" >/dev/null; then
      printf '%s\n' "$GITHUB_BASE_REF"
      return 0
    fi
  fi

  if git -C "$ROOT_DIR" rev-parse --verify --quiet 'origin/main^{commit}' >/dev/null; then
    printf '%s\n' 'origin/main'
    return 0
  fi

  if git -C "$ROOT_DIR" rev-parse --verify --quiet 'main^{commit}' >/dev/null; then
    printf '%s\n' 'main'
    return 0
  fi

  return 1
}

is_ignored_file() {
  local file="$1"
  [[ "$file" == messages/* ]] ||
    [[ "$file" == content/articles/* ]] ||
    [[ "$file" == lib/content/* ]] ||
    [[ "$file" == lib/api/__fixtures__/* ]] ||
    [[ "$file" == *.test.ts ]] ||
    [[ "$file" == *.test.tsx ]]
}

is_ignored_line() {
  local line="$1"
  local trimmed
  trimmed="$(printf '%s' "$line" | sed -E 's/^[[:space:]]+//')"

  if [[ "$trimmed" == //* || "$trimmed" == "/*"* || "$trimmed" == \** || "$trimmed" == "{/*"* ]]; then
    return 0
  fi

  [[ "$line" == *"i18n:allow-hardcoded-copy"* ]]
}

has_korean_text() {
  local line="$1"
  printf '%s\n' "$line" | rg -q '[가-힣]'
}

base_ref=""
diff_args=()
if base_ref="$(resolve_base_ref)"; then
  if merge_base="$(git -C "$ROOT_DIR" merge-base HEAD "$base_ref" 2>/dev/null)"; then
    diff_args=("$merge_base")
  else
    diff_args=("$base_ref")
  fi
fi

tmp_output="$(mktemp)"
trap 'rm -f "$tmp_output"' EXIT

current_file=""
current_line=0

while IFS= read -r diff_line; do
  if [[ "$diff_line" == "+++ b/"* ]]; then
    current_file="${diff_line#+++ b/}"
    if is_ignored_file "$current_file"; then
      current_file=""
    fi
    continue
  fi

  if [[ "$diff_line" == "@@ "* ]]; then
    if [[ "$diff_line" =~ \+([0-9]+)(,([0-9]+))? ]]; then
      current_line="${BASH_REMATCH[1]}"
    fi
    continue
  fi

  if [[ -z "$current_file" || "$diff_line" == +++* ]]; then
    continue
  fi

  if [[ "$diff_line" != +* ]]; then
    continue
  fi

  added_line="${diff_line#+}"
  candidate_line="$current_line"
  current_line=$((current_line + 1))

  if ! has_korean_text "$added_line"; then
    continue
  fi

  if is_ignored_line "$added_line"; then
    continue
  fi

  printf '%s:%s: %s\n' "$current_file" "$candidate_line" "$added_line" >> "$tmp_output"
done < <(
  git -C "$ROOT_DIR" diff \
    --unified=0 \
    --diff-filter=ACMR \
    "${diff_args[@]}" \
    -- \
    ':(glob)app/**/*.ts' \
    ':(glob)app/**/*.tsx' \
    ':(glob)components/**/*.ts' \
    ':(glob)components/**/*.tsx' \
    ':(glob)lib/**/*.ts'
)

if [[ -s "$tmp_output" ]]; then
  cat <<'EOF'
i18n guard found hardcoded Korean copy outside messages/ or locale content.
Move user-facing copy to messages/{locale}.json or a locale-aware content module.
For deliberate non-user-facing diagnostics or logs, append // i18n:allow-hardcoded-copy on the same line.

EOF
  cat "$tmp_output"
  exit 1
fi

echo "i18n guard: no hardcoded Korean copy candidates found."
