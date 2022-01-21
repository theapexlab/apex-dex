import { HTMLInputTypeAttribute, forwardRef, ChangeEventHandler } from 'react';

type Props = {
  type?: HTMLInputTypeAttribute;
  label: string;
  'aria-describedby': string;
  currency: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export const InputGroup = forwardRef<HTMLInputElement, Props>(
  ({ type = 'text', label, 'aria-describedby': ariaDescribedby, currency, value, onChange }, ref) => (
    <div className="relative border border-gray-300 rounded-md px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-slate-600 focus-within:border-slate-600">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative px-3 py-2 ">
        <input
          ref={ref}
          type={type}
          name={label}
          id={label}
          value={value}
          className="block border-0 p-0 text-gray-900 placeholder-gray-500 w-full pr-12 focus:ring-0 sm:text-sm"
          placeholder="0.00"
          aria-describedby={ariaDescribedby}
          onChange={onChange}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm" id={ariaDescribedby}>
            {currency}
          </span>
        </div>
      </div>
    </div>
  )
);
