import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-white">문제가 발생했어요</h1>
      <p className="mt-3 text-slate-300">
        {status === 404
          ? '찾으려는 페이지가 존재하지 않습니다.'
          : '예상치 못한 오류가 발생했어요. 잠시 후 다시 시도해주세요.'}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};
