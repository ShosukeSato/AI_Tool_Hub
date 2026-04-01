export function ProsCons({
  pros,
  cons,
}: {
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <span className="text-green-600">&#10003;</span> メリット
        </h3>
        <ul className="space-y-2">
          {pros.map((pro, i) => (
            <li key={i} className="text-sm text-green-900 flex gap-2">
              <span className="text-green-500 shrink-0">+</span>
              {pro}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-red-50 rounded-xl p-6">
        <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
          <span className="text-red-600">&#10007;</span> デメリット
        </h3>
        <ul className="space-y-2">
          {cons.map((con, i) => (
            <li key={i} className="text-sm text-red-900 flex gap-2">
              <span className="text-red-500 shrink-0">-</span>
              {con}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
