interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = '로딩 중입니다…' }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-300">
      <span className="h-3 w-3 animate-ping rounded-full bg-rose-400" aria-hidden />
      <p className="text-sm font-medium" role="status">
        {message}
      </p>
    </div>
  );
}
