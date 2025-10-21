import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '../app/App';

describe('TED English Studio', () => {
  it('분석을 실행하면 요약이 표시된다', async () => {
    render(<App />);

    const textarea = screen.getByLabelText('TED 트랜스크립트 붙여넣기');
    await userEvent.type(textarea, 'This is a sample transcript. It has multiple sentences.');

    const submit = screen.getByRole('button', { name: '분석 시작' });
    await userEvent.click(submit);

    expect(await screen.findByText(/Ideas worth spreading/i)).toBeInTheDocument();
    expect(screen.getByText(/가정법 과거/)).toBeInTheDocument();
    expect(screen.getByText(/resilience/)).toBeInTheDocument();
  });

  it('프록시 없이 URL만 입력하면 경고를 노출한다', async () => {
    render(<App />);

    const urlInput = screen.getByLabelText('TED URL');
    fireEvent.change(urlInput, { target: { value: 'https://www.ted.com/talks/example' } });

    const submit = screen.getByRole('button', { name: '분석 시작' });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/CORS 프록시/)).toBeInTheDocument();
    });
  });
});
