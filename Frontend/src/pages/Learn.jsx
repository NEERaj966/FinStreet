import React from 'react'

const Learn = () => {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Learn Finance
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
            Investment basics, explained clearly
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Build a strong foundation before you invest. These quick guides
            cover the essentials: risk, returns, diversification, and how to
            choose instruments that fit your goals.
          </p>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'FDs (Fixed Deposits)',
              points: [
                'Low risk with predictable returns.',
                'Best for emergency funds or short-term goals.',
                'Compare interest rates and lock-in periods.',
              ],
            },
            {
              title: 'Equity & Stocks',
              points: [
                'Higher growth potential, higher volatility.',
                'Ideal for long-term goals (5+ years).',
                'Diversify across sectors to reduce risk.',
              ],
            },
            {
              title: 'Gold',
              points: [
                'Acts as a hedge against inflation.',
                'Use ETFs or sovereign gold bonds.',
                'Keep allocation modest (5–10%).',
              ],
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]"
            >
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                {card.points.map((point) => (
                  <p key={point}>• {point}</p>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <h2 className="text-lg font-semibold text-white">
              Smart investing checklist
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {[
                'Define goal, timeline, and risk level.',
                'Diversify across asset types and sectors.',
                'Invest consistently instead of timing the market.',
                'Rebalance yearly to maintain target allocation.',
                'Keep an emergency fund before high-risk bets.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <h2 className="text-lg font-semibold text-white">
              Risk vs return
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                Higher returns usually mean higher volatility. Align your
                investments with your time horizon so short-term swings do not
                force you to sell early.
              </p>
              <p>
                A simple approach is a core-satellite mix: keep a stable core
                (FDs, bonds, index funds) and a smaller satellite in higher
                growth assets (equities).
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          <h2 className="text-lg font-semibold text-white">Important links</h2>
          <p className="mt-2 text-sm text-slate-400">
            Use trusted sources to verify products, compare returns, and learn
            more.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-emerald-400/40"
              href="https://www.sebi.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              SEBI investor education
            </a>
            <a
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-emerald-400/40"
              href="https://www.rbi.org.in/"
              target="_blank"
              rel="noreferrer"
            >
              Reserve Bank of India
            </a>
            <a
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-emerald-400/40"
              href="https://www.mutualfundssahi.com/en"
              target="_blank"
              rel="noreferrer"
            >
              Mutual Funds Sahi Hai
            </a>
            <a
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-emerald-400/40"
              href="https://www.nseindia.com/"
              target="_blank"
              rel="noreferrer"
            >
              NSE India
            </a>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <h2 className="text-lg font-semibold text-white">Quick reminder</h2>
          <p className="mt-2 text-sm text-emerald-100">
            Investing involves risk. Always consider your financial goals and
            consult a qualified advisor if needed.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Learn
