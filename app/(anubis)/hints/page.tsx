export const revalidate = 300;

export default function Page() {
  return (
    <section className="panel">
      <h1>Hints</h1>
      <ul>
        <li>View source. Search for HTML comments.</li>
        <li>Open console. Read messages.</li>
        <li>
          Change <code>{'<img id="p" src="...">'}</code> to hidden variants.
        </li>
        <li>Check network, robots, and CSS print rules.</li>
      </ul>
      <p><small>No spoilers. All hints are in-level.</small></p>
    </section>
  );
}

