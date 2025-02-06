import React, { useState, useEffect, useCallback } from 'react';
import { QueueManager } from './q';

export function QueueVisualizer() {
    const [queueState, setQueueState] = useState(null);
    const [queueManager, setQueueManager] = useState(null);

    useEffect(() => {
        const manager = new QueueManager(3, (state) => {
            setQueueState(state);
        });
        setQueueManager(manager);

        return () => {
            if (manager) {
                manager.stop();
            }
        };
    }, []);

    const handleStartStop = () => {
        if (queueManager) {
            if (queueState?.isRunning) {
                queueManager.stop();
            } else {
                queueManager.start();
            }
        }
    };

    if (!queueState) return <div>Loading...</div>;

    return (
        <div className="queue-visualizer">
            <div className="controls">
                <button onClick={handleStartStop}>
                    {queueState.isRunning ? 'Stop' : 'Start'}
                </button>
                <div>Total Jobs Created: {queueState.totalJobsCreated}</div>
            </div>

            <div className="queue-status">
                <h3>Queue Length: {queueState.queuedJobs.length}</h3>
                <div className="queued-jobs">
                    {queueState.queuedJobs.map(job => (
                        <div key={job.id} className="job-item">
                            Job {job.id} ({job.processingTime}ms)
                        </div>
                    ))}
                </div>
            </div>

            <div className="workers-status">
                <h3>Workers</h3>
                {queueState.workers.map(worker => (
                    <div key={worker.id} className={`worker ${worker.busy ? 'busy' : 'idle'}`}>
                        <div>Worker {worker.id}</div>
                        {worker.currentJob && (
                            <div>
                                Processing Job {worker.currentJob.id}
                                ({worker.currentJob.processingTime}ms)
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
