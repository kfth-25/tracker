import React from 'react';

const CallLogTable = ({ calls }) => {
  return (
    <div className="card">
      <h2>Call Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>Time</th>
            <th>IP Address</th>
            <th>Location</th>
            <th>Provider</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id}>
              <td>{call.phone_number}</td>
              <td>{new Date(call.call_time).toLocaleString()}</td>
              <td>{call.ip_address || '-'}</td>
              <td>{call.city && call.country ? `${call.city}, ${call.country}` : (call.country || call.city || '-')}</td>
              <td>{call.provider || '-'}</td>
              <td>{call.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CallLogTable;
