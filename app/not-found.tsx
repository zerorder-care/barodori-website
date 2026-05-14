import Link from 'next/link'

export default function RootNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-bold">찾으시는 페이지를 찾을 수 없어요</h1>
        <p className="mt-3 text-sm text-slate-500">주소가 잘못 입력되었거나 페이지가 이동되었을 수 있어요.</p>
        <Link
          href="/ko"
          className="mt-8 inline-flex rounded-full bg-[#FFB700] px-6 py-3 text-sm font-bold text-black"
        >
          홈으로 가기
        </Link>
      </div>
    </main>
  )
}

