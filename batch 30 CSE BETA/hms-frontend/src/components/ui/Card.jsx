export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};
