import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav';
import client from '../api/client';

interface Product {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
}

interface Parameter {
  id: string;
  name: string;
  unit: string | null;
  data_type: string;
  target_value: number | null;
  spec_min: number | null;
  spec_max: number | null;
  warn_min: number | null;
  warn_max: number | null;
  decimal_places: number;
  select_options: string[] | null;
  method_description: string | null;
  is_required: boolean;
  sort_order: number;
}

interface Batch {
  id: string;
  batch_number: string;
  status: string;
}

type EvalResult = 'pass' | 'warn' | 'fail' | 'na' | null;

function evaluateNumeric(value: number, param: Parameter): EvalResult {
  if (param.spec_min !== null && value < param.spec_min) return 'fail';
  if (param.spec_max !== null && value > param.spec_max) return 'fail';
  if (param.warn_min !== null && value < param.warn_min) return 'warn';
  if (param.warn_max !== null && value > param.warn_max) return 'warn';
  return 'pass';
}

const evalConfig = {
  pass: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', label: 'Pass', rowBg: '#f0fdf4' },
  warn: { bg: '#fefce8', border: '#fde047', color: '#a16207', label: 'Warning', rowBg: '#fefce8' },
  fail: { bg: '#fff1f2', border: '#fca5a5', color: '#b91c1c', label: 'Fail', rowBg: '#fff1f2' },
  na:   { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', label: 'N/A', rowBg: '#fff' },
};

export default function EnterResults() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [values, setValues] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [newBatchNumber, setNewBatchNumber] = useState('');

  useEffect(() => {
    client.get('/products/').then(res => setProducts(res.data));
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    client.get(`/parameters/product/${selectedProduct}`).then(res => setParameters(res.data));
    client.get(`/batches/?product_id=${selectedProduct}`).then(res => setBatches(res.data));
    setValues({});
    setNotes({});
    setSelectedBatch('');
    setSubmitted(false);
  }, [selectedProduct]);

  const getEval = (param: Parameter): EvalResult => {
    const v = values[param.id];
    if (v === undefined || v === '') return null;
    if (param.data_type === 'numeric') {
      const num = parseFloat(v);
      if (isNaN(num)) return null;
      return evaluateNumeric(num, param);
    }
    if (param.data_type === 'boolean') return v === true ? 'pass' : 'fail';
    return 'na';
  };

  const overallStatus = (): EvalResult => {
    if (parameters.length === 0) return null;
    const evals = parameters.map(p => getEval(p)).filter(Boolean);
    if (evals.length === 0) return null;
    if (evals.includes('fail')) return 'fail';
    if (evals.includes('warn')) return 'warn';
    return 'pass';
  };

  const filledCount = parameters.filter(p =>
    values[p.id] !== undefined && values[p.id] !== ''
  ).length;

  const handleCreateBatch = async () => {
    if (!newBatchNumber.trim() || !selectedProduct) return;
    try {
      const res = await client.post('/batches/', {
        product_id: selectedProduct,
        batch_number: newBatchNumber.trim(),
      });
      setBatches(prev => [res.data, ...prev]);
      setSelectedBatch(res.data.id);
      setShowNewBatch(false);
      setNewBatchNumber('');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to create batch');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduct) return;
    setError('');
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      for (const param of parameters) {
        const v = values[param.id];
        if ((v === undefined || v === '') && param.is_required) {
          setError(`"${param.name}" is required.`);
          setSubmitting(false);
          return;
        }
        if (v === undefined || v === '') continue;
        const payload: any = {
          product_id: selectedProduct,
          parameter_id: param.id,
          batch_id: selectedBatch || null,
          measured_at: now,
          notes: notes[param.id] || null,
        };
        if (param.data_type === 'numeric') payload.value_numeric = parseFloat(v);
        else if (param.data_type === 'boolean') payload.value_boolean = v;
        else payload.value_text = v;
        await client.post('/results/', payload);
      }
      setSubmitted(true);
      setValues({});
      setNotes({});
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setValues({});
    setNotes({});
    setSubmitted(false);
    setError('');
  };

  const overall = overallStatus();
  const oc = overall ? evalConfig[overall] : null;

  const selStyle = (active: boolean, variant?: 'pass' | 'fail' | 'select') => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: `2px solid ${active
      ? variant === 'fail' ? '#ef4444' : variant === 'pass' ? '#22c55e' : '#3b82f6'
      : '#e2e8f0'}`,
    background: active
      ? variant === 'fail' ? '#fee2e2' : variant === 'pass' ? '#dcfce7' : '#eff6ff'
      : '#fff',
    color: active
      ? variant === 'fail' ? '#b91c1c' : variant === 'pass' ? '#15803d' : '#2563eb'
      : '#64748b',
    fontSize: '14px',
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      {/* Toolbar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginRight: '8px' }}>
          Enter results
        </div>

        {/* Product selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Product
          </label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            style={{
              height: '40px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0 14px',
              fontSize: '14px',
              fontWeight: 500,
              background: '#fff',
              color: '#0f172a',
              minWidth: '200px',
              outline: 'none',
            }}
          >
            <option value="">Select product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Batch selector */}
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Batch (optional)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedBatch}
                onChange={e => {
                  if (e.target.value === '__new__') {
                    setShowNewBatch(true);
                  } else {
                    setSelectedBatch(e.target.value);
                    setShowNewBatch(false);
                  }
                }}
                style={{
                  height: '40px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0 14px',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: '#fff',
                  color: '#0f172a',
                  minWidth: '200px',
                  outline: 'none',
                }}
              >
                <option value="">No batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batch_number}</option>
                ))}
                <option value="__new__">+ Create new batch...</option>
              </select>
              {showNewBatch && (
                <>
                  <input
                    placeholder="Batch number"
                    value={newBatchNumber}
                    onChange={e => setNewBatchNumber(e.target.value)}
                    style={{
                      height: '40px',
                      border: '1.5px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '160px',
                    }}
                  />
                  <button
                    onClick={handleCreateBatch}
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Create
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Overall status */}
        {oc && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Overall:</span>
            <div style={{
              background: oc.bg,
              border: `1.5px solid ${oc.border}`,
              color: oc.color,
              borderRadius: '20px',
              padding: '6px 18px',
              fontSize: '14px',
              fontWeight: 700,
            }}>
              {oc.label}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: '24px 32px' }}>
        {!selectedProduct && (
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '60px 32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }}>⬆</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Select a product to begin
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              Choose the product you are testing from the dropdown above.
            </div>
          </div>
        )}

        {selectedProduct && parameters.length > 0 && (
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Grid header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '220px 200px 1fr 100px 90px',
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
            }}>
              {['Parameter', 'Value', 'Spec range · Target', 'Note', 'Status'].map((h, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  borderRight: i < 4 ? '1px solid #e2e8f0' : 'none',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Parameter rows */}
            {parameters.map((param, idx) => {
              const ev = getEval(param);
              const ec = ev ? evalConfig[ev] : null;

              return (
                <div
                  key={param.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 200px 1fr 100px 90px',
                    borderBottom: idx < parameters.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: ec ? ec.rowBg : '#fff',
                    transition: 'background 0.15s',
                    minHeight: '64px',
                  }}
                >
                  {/* Parameter name */}
                  <div style={{
                    padding: '14px 16px',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                      {param.name}
                      {param.is_required && (
                        <span style={{ color: '#ef4444', marginLeft: '4px', fontSize: '13px' }}>*</span>
                      )}
                    </div>
                    {param.unit && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{param.unit}</div>
                    )}
                    {param.method_description && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.4 }}>
                        {param.method_description}
                      </div>
                    )}
                  </div>

                  {/* Value input */}
                  <div style={{
                    padding: '14px 16px',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {param.data_type === 'numeric' && (
                      <input
                        type="number"
                        step={Math.pow(10, -param.decimal_places).toString()}
                        placeholder={`Enter ${param.unit || 'value'}`}
                        value={values[param.id] ?? ''}
                        onChange={e => setValues(prev => ({ ...prev, [param.id]: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '44px',
                          border: `2px solid ${ec ? ec.border : '#e2e8f0'}`,
                          borderRadius: '8px',
                          padding: '0 14px',
                          fontSize: '16px',
                          fontWeight: 600,
                          outline: 'none',
                          background: ec ? ec.bg : '#f8fafc',
                          color: '#0f172a',
                          textAlign: 'center',
                        }}
                      />
                    )}

                    {param.data_type === 'boolean' && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          onClick={() => setValues(prev => ({ ...prev, [param.id]: true }))}
                          style={selStyle(values[param.id] === true, 'pass')}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => setValues(prev => ({ ...prev, [param.id]: false }))}
                          style={selStyle(values[param.id] === false, 'fail')}
                        >
                          Fail
                        </button>
                      </div>
                    )}

                    {param.data_type === 'select' && (
                      <select
                        value={values[param.id] ?? ''}
                        onChange={e => setValues(prev => ({ ...prev, [param.id]: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '44px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '14px',
                          fontWeight: 500,
                          outline: 'none',
                          background: '#f8fafc',
                          color: '#0f172a',
                        }}
                      >
                        <option value="">Select...</option>
                        {(param.select_options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {param.data_type === 'text' && (
                      <input
                        type="text"
                        placeholder="Enter value"
                        value={values[param.id] ?? ''}
                        onChange={e => setValues(prev => ({ ...prev, [param.id]: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '44px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0 14px',
                          fontSize: '14px',
                          outline: 'none',
                          background: '#f8fafc',
                          color: '#0f172a',
                        }}
                      />
                    )}
                  </div>

                  {/* Spec range */}
                  <div style={{
                    padding: '14px 16px',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                  }}>
                    {param.data_type === 'numeric' && (
                      <>
                        <div style={{ fontSize: '13px', color: '#475569' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>Range: </span>
                          {param.spec_min ?? '—'} – {param.spec_max ?? '—'}
                          {param.unit ? ` ${param.unit}` : ''}
                        </div>
                        {param.target_value !== null && (
                          <div style={{ fontSize: '13px', color: '#475569' }}>
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Target: </span>
                            {param.target_value} {param.unit}
                          </div>
                        )}
                        {(param.warn_min !== null || param.warn_max !== null) && (
                          <div style={{ fontSize: '11px', color: '#a16207' }}>
                            Warn: {param.warn_min ?? '—'} – {param.warn_max ?? '—'}
                          </div>
                        )}
                      </>
                    )}
                    {param.data_type !== 'numeric' && (
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>—</div>
                    )}
                  </div>

                  {/* Note */}
                  <div style={{
                    padding: '14px 10px',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <input
                      type="text"
                      placeholder="Note"
                      value={notes[param.id] ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [param.id]: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '36px',
                        border: '1px solid #f1f5f9',
                        borderRadius: '6px',
                        padding: '0 8px',
                        fontSize: '12px',
                        outline: 'none',
                        background: 'transparent',
                        color: '#64748b',
                      }}
                    />
                  </div>

                  {/* Status badge */}
                  <div style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {ec ? (
                      <div style={{
                        background: ec.bg,
                        border: `1.5px solid ${ec.border}`,
                        color: ec.color,
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                        {ec.label}
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#cbd5e1' }}>—</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '2px solid #e2e8f0',
              background: '#fafafa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                {filledCount} of {parameters.length} filled
                {selectedBatch && batches.length > 0 && (
                  <span> · Batch: {batches.find(b => b.id === selectedBatch)?.batch_number}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {error && (
                  <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 500 }}>{error}</span>
                )}
                {submitted && (
                  <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                    ✓ Submitted successfully
                  </span>
                )}
                <button
                  onClick={handleClear}
                  style={{
                    height: '42px',
                    padding: '0 20px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    height: '42px',
                    padding: '0 28px',
                    background: submitting ? '#93c5fd' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit results'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}