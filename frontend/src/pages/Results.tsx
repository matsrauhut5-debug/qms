import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import api from "../api/client";

interface Product {
  id: string;
  name: string;
}

interface Parameter {
  id: string;
  name: string;
  unit?: string;
}

interface Batch {
  id: string;
  batch_number: string;
}

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
}

interface TestResult {
  id: string;
  product: Product | null;
  parameter: Parameter | null;
  batch: Batch | null;
  creator: Creator | null;
  value_numeric: number | null;
  value_boolean: boolean | null;
  value_text: string | null;
  status: string;
  evaluation: string;
  snap_spec_min: number | null;
  snap_spec_max: number | null;
  snap_target_value: number | null;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

const EVALUATION_STYLES: Record<string, string> = {
  pass: "bg-green-100 text-green-800",
  warn: "bg-amber-100 text-amber-800",
  fail: "bg-red-100 text-red-800",
  na: "bg-gray-100 text-gray-600",
};

const EVALUATION_LABELS: Record<string, string> = {
  pass: "Pass",
  warn: "Warn",
  fail: "Fail",
  na: "N/A",
};

function formatValue(result: TestResult): string {
  if (result.value_numeric !== null && result.value_numeric !== undefined) {
    const unit = result.parameter?.unit ? ` ${result.parameter.unit}` : "";
    return `${result.value_numeric}${unit}`;
  }
  if (result.value_boolean !== null && result.value_boolean !== undefined) {
    return result.value_boolean ? "Pass" : "Fail";
  }
  if (result.value_text) return result.value_text;
  return "—";
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Results() {
  const navigate = useNavigate();

  const [results, setResults] = useState<TestResult[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterProduct, setFilterProduct] = useState("");
  const [filterEvaluation, setFilterEvaluation] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Detail panel
  const [selected, setSelected] = useState<TestResult | null>(null);

  // Load products for filter dropdown
  useEffect(() => {
    api.get("/products/").then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  // Load results whenever filters change
  useEffect(() => {
    fetchResults();
  }, [filterProduct, filterEvaluation, filterDateFrom, filterDateTo]);

  async function fetchResults() {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filterProduct) params.product_id = filterProduct;
      if (filterEvaluation) params.evaluation = filterEvaluation;
      if (filterDateFrom) params.date_from = filterDateFrom;
      if (filterDateTo) params.date_to = filterDateTo;

      const res = await api.get("/results/", { params });
      setResults(res.data);
    } catch (err: any) {
      setError("Failed to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilterProduct("");
    setFilterEvaluation("");
    setFilterDateFrom("");
    setFilterDateTo("");
  }

  const hasFilters = filterProduct || filterEvaluation || filterDateFrom || filterDateTo;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <TopNav />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            All submitted test results for your products
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Product
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
            >
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status
            </label>
            <select
              value={filterEvaluation}
              onChange={(e) => setFilterEvaluation(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="">All statuses</option>
              <option value="pass">Pass</option>
              <option value="warn">Warn</option>
              <option value="fail">Fail</option>
              <option value="na">N/A</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline self-end"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto self-end text-sm text-gray-400">
            {!loading && `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Loading results...
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-sm font-medium">No results found</div>
              <div className="text-xs mt-1">
                {hasFilters ? "Try clearing your filters" : "Submit some results to see them here"}
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Date / Time
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Parameter
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Value
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Operator
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selected?.id === r.id ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDateTime(r.measured_at || r.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {r.product?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.parameter?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-mono">
                      {formatValue(r)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          EVALUATION_STYLES[r.evaluation] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {EVALUATION_LABELS[r.evaluation] ?? r.evaluation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.creator
                        ? `${r.creator.first_name} ${r.creator.last_name}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail side panel */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Result detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Panel body */}
            <div className="px-6 py-5 space-y-5">

              {/* Evaluation badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    EVALUATION_STYLES[selected.evaluation] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {EVALUATION_LABELS[selected.evaluation] ?? selected.evaluation}
                </span>
                <span className="text-sm text-gray-500 capitalize">{selected.status}</span>
              </div>

              <DetailRow label="Product" value={selected.product?.name} />
              <DetailRow label="Parameter" value={selected.parameter?.name} />
              <DetailRow label="Value" value={formatValue(selected)} mono />
              <DetailRow label="Unit" value={selected.parameter?.unit} />
              <DetailRow
                label="Spec range"
                value={
                  selected.snap_spec_min !== null && selected.snap_spec_max !== null
                    ? `${selected.snap_spec_min} – ${selected.snap_spec_max}`
                    : undefined
                }
              />
              <DetailRow
                label="Target"
                value={selected.snap_target_value?.toString()}
              />
              <DetailRow
                label="Batch"
                value={selected.batch?.batch_number}
              />
              <DetailRow
                label="Measured at"
                value={formatDateTime(selected.measured_at || selected.created_at)}
              />
              <DetailRow
                label="Operator"
                value={
                  selected.creator
                    ? `${selected.creator.first_name} ${selected.creator.last_name}`
                    : undefined
                }
              />
              {selected.notes && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Notes
                  </div>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-md px-3 py-2">
                    {selected.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}