import "./App.css";
import { QueueManager, Job, Worker } from "./q.js";
import {QueueVisualizer} from "./QueueVis.jsx";


export default function App() {
  return (
    <main>
      <QueueVisualizer/>
    </main>
  );
}
