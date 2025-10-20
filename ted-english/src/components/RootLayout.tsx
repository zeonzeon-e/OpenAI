import { Fragment } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';

const navigation = [
  { name: '홈', href: '/' },
];

export const RootLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-slate-950 font-black">TE</span>
            TED English Companion
          </Link>
          <Popover className="relative lg:hidden">
            {({ open }) => (
              <>
                <Popover.Button className="inline-flex items-center rounded-md bg-slate-800 p-2 text-slate-100 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  <span className="sr-only">메뉴 열기</span>
                  <Bars3Icon className="h-6 w-6" />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 z-10 mt-3 w-screen max-w-[220px] rounded-lg bg-slate-900 shadow-lg ring-1 ring-slate-700">
                    <div className="space-y-1 p-4">
                      {navigation.map((item) => (
                        <Popover.Button
                          as={Link}
                          key={item.name}
                          to={item.href}
                          className={clsx(
                            'block rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white',
                            location.pathname === item.href && 'bg-slate-800 text-white'
                          )}
                        >
                          {item.name}
                        </Popover.Button>
                      ))}
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'transition hover:text-white',
                  location.pathname === item.href && 'text-white'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 bg-slate-900/80">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} TED English Companion. 비공식 팬 메이드 학습 도구입니다.
        </div>
      </footer>
    </div>
  );
};
