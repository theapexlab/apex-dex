type Props = {
  icon: React.ReactNode | string;
  message: string;
};

export const Info: React.FC<Props> = ({ icon, message }) => (
  <div className="rounded-md bg-slate-50 p-4">
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-sm text-slate-700">{message}</p>
    </div>
  </div>
);
