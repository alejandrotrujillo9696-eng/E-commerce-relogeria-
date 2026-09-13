import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBSpinner,
} from 'mdb-react-ui-kit';
import { getDashboardSalesRequest } from '../../services/adminDashboardService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '12m', label: 'Últimos 12 meses' },
];

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

function AdminSalesChart() {
  const [period, setPeriod] = useState('30d');
  const [series, setSeries] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getDashboardSalesRequest(period);
        setSeries({
          labels: response.labels || [],
          data: response.data || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No fue posible cargar la gráfica de ventas.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [period]);

  const chartData = useMemo(() => ({
    labels: series.labels,
    datasets: [
      {
        label: 'Ventas',
        data: series.data,
        borderColor: '#1266f1',
        backgroundColor: 'rgba(18, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }), [series]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 12,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
    },
  }), []);

  const totalPeriodSales = useMemo(() => {
    const sum = series.data.reduce((acc, value) => acc + (Number(value) || 0), 0);
    return formatCurrency(sum);
  }, [series]);

  if (loading) {
    return (
      <MDBContainer className="my-4">
        <div className="admin-page-title">Ventas</div>
        <div className="admin-page-subtitle">Evolución de ventas en el período seleccionado</div>
        <div className="text-center my-5">
          <MDBSpinner role="status" />
        </div>
      </MDBContainer>
    );
  }

  if (error) {
    return (
      <MDBContainer className="my-4">
        <div className="admin-page-title">Ventas</div>
        <div className="admin-page-subtitle">Evolución de ventas en el período seleccionado</div>
        <div className="admin-feedback admin-feedback-error">{error}</div>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="my-4">
      <div className="admin-page-title">Ventas</div>
      <div className="admin-page-subtitle">
        Evolución de ventas en el período seleccionado
        <span className="text-muted ms-2">Total: {totalPeriodSales}</span>
      </div>
      <MDBRow className="mt-3 align-items-center">
        <MDBCol md="4" lg="3">
          <div className="mb-3">
            <label className="form-label">Período</label>
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </MDBCol>
      </MDBRow>
      <div className="admin-panel mt-3" style={{ height: '360px' }}>
        {series.labels.length === 0 ? (
          <div className="text-center text-muted my-5">
            No hay ventas registradas en este período.
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </MDBContainer>
  );
}

export default AdminSalesChart;
