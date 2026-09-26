export function EmberProgress({ step, total, labels }) {
  return (
    <div className="flex items-center w-full mb-8">
      {labels.map((label, i) => {
        const idx = i + 1;
        const active = idx <= step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center" style={{ minWidth: 76 }}>
              <div
                className={`rounded-full flex items-center justify-center font-bold text-[12px] w-[30px] h-[30px] border transition-all ${
                  active ? "bg-ember text-ink border-transparent" : "bg-surfaceAlt text-muted border-border"
                }`}
              >
                {idx}
              </div>
              <span className={`mt-2 text-center text-[11px] tracking-wide ${active ? "text-white" : "text-muted"}`}>
                {label}
              </span>
            </div>
            {idx < total && (
              <div
                className={`flex-1 mx-1 h-[2px] mb-[18px] transition-all ${
                  idx < step ? "bg-ember" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Field({ label, children, required, hint }) {
  return (
    <label className="block mb-4">
      <span className="block mb-1.5 text-[12.5px] text-muted tracking-wide">
        {label} {required && <span className="text-flame1">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none"
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none appearance-none"
    >
      {props.children}
    </select>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-6 ${className}`}>{children}</div>
  );
}

export function Button({ children, onClick, variant = "primary", disabled, type = "button" }) {
  const variants = {
    primary: "bg-ember text-[#1A0E06]",
    ghost: "bg-transparent text-white border border-border",
    text: "bg-transparent text-muted px-2",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-[9px] text-sm font-semibold transition-transform active:scale-95 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 text-[13px] border-b border-border">
      <span className="text-muted">{label}</span>
      <span className="text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function ErrorText({ children }) {
  return <span className="text-danger text-[11px] mt-1 block">{children}</span>;
}

export function Divider() {
  return <div className="h-px bg-border my-4" />;
}
