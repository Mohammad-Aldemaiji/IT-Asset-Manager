import PageHeader from '../components/PageHeader';
import team from '../data/team';

/** About page: what the app is and who built it (names and student IDs). */
export default function AboutPage() {
  return (
    <>
      <PageHeader title="About" subtitle="IT Asset Manager — course project, Part 1." />

      <section className="card">
        <h2>The application</h2>
        <p>
          IT Asset Manager helps a company keep track of its IT equipment: laptops, desktops, monitors,
          servers, printers, phones, tablets and network devices. Users can add, view, update, delete and
          search assets, and see a summary on the dashboard.
        </p>
        <p className="muted">
          In Part 1 the data is a collection of JavaScript objects kept in memory, so changes are lost when the
          page is reloaded. Part 2 adds a backend and database.
        </p>
      </section>

      <section className="card">
        <h2>Team members</h2>
        <div className="table-wrap">
          <table className="team-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Student ID</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member, index) => (
                <tr key={member.studentId + member.name}>
                  <td>{index + 1}</td>
                  <td>{member.name}</td>
                  <td className="mono">{member.studentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
