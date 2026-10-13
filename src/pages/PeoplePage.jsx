import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function PeoplePage() {
  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchPeople = async () => {
      setLoading(true);
      setError('');

      try {
        const params = department !== 'all' ? { department } : {};
        const res = await apiClient.get('/people', { params });
        if (active) {
          setEmployees(res.data.employees || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load people directory.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPeople();
    return () => {
      active = false;
    };
  }, [department]);

  const departments = useMemo(
    () => ['all', ...new Set(employees.map((employee) => employee.department))],
    [employees],
  );

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="spinner" /></div>;
  }

  if (error) {
    return <div className="card p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Directory</div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">People overview</h2>
          </div>

          <div className="w-full max-w-xs">
            <label className="form-label" htmlFor="department">Department</label>
            <select id="department" className="form-select" value={department} onChange={(event) => setDepartment(event.target.value)}>
              {departments.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All departments' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Location</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <Link to={`/people/${employee.id}`} className="font-semibold text-blue-700 hover:underline">
                      {employee.name}
                    </Link>
                    <div className="text-xs text-slate-500">{employee.id}</div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{employee.role}</span>
                  </td>
                  <td>{employee.department}</td>
                  <td>{employee.location}</td>
                  <td>{employee.managerId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
