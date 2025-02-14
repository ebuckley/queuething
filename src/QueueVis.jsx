import React, { useState, useEffect, useCallback } from 'react';
import { QueueManager } from './q';

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
    },
    configControls: {
        marginTop: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f5f5f5'
    },
    configItem: {
        margin: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '14px',
        color: '#666'
    },
    input: {
        width: '100%'
    },
    queueStatus: {
        marginTop: '20px',
        padding: '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '5px',
        backgroundColor: '#fff'
    },
    queuedJobs: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '10px'
    },
    jobItem: {
        padding: '8px 12px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    workersStatus: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    worker: {
        padding: '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '5px',
        backgroundColor: '#fff'
    },
    workerBusy: {
        borderColor: '#4caf50',
        backgroundColor: '#f1f8e9'
    },
    workerIdle: {
        borderColor: '#9e9e9e',
        backgroundColor: '#fafafa'
    },
    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#e0e0e0',
        borderRadius: '3px',
        overflow: 'hidden',
        marginTop: '8px'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4caf50',
        transition: 'width 0.3s ease-in-out'
    },
    button: {
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: '#4caf50',
        '&:hover': {
            backgroundColor: '#45a049'
        }
    },
    stopButton: {
        backgroundColor: '#f44336',
        '&:hover': {
            backgroundColor: '#d32f2f'
        }
    },
    statsPanel: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '10px',
        color: '#666'
    },
    metricsPanel: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
    },
    metricGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '10px'
    },
    metricCard: {
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    metricLabel: {
        fontSize: '14px',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    metricValue: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2196f3'
    }
};

export function QueueVisualizer() {
    const [queueState, setQueueState] = useState(null);
    const [queueManager, setQueueManager] = useState(null);
    const [config, setConfig] = useState({
        minProcessingTime: 1000,
        maxProcessingTime: 5000,
        jobCreationInterval: 2000
    });

    useEffect(() => {
        const manager = new QueueManager(1, (state) => {
            setQueueState(state);
        }, config);
        setQueueManager(manager);

        return () => {
            if (manager) {
                manager.stop();
            }
        };
    }, [config]);

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
        <div style={styles.container}>
            <div className="controls">
                <button 
                    style={{
                        ...styles.button,
                        backgroundColor: queueState.isRunning ? '#f44336' : '#4caf50',
                        transform: `scale(${queueState.isRunning ? '0.98' : '1'})`,
                        boxShadow: queueState.isRunning 
                            ? '0 2px 4px rgba(0,0,0,0.1)'
                            : '0 4px 8px rgba(0,0,0,0.1)',
                    }} 
                    onClick={handleStartStop}
                >
                    {queueState.isRunning ? (
                        <>
                            <span style={{ fontSize: '20px' }}>⏹</span>
                            <span>Stop Queue</span>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '20px' }}>▶️</span>
                            <span>Start Queue</span>
                        </>
                    )}
                </button>
                <div style={styles.metricsPanel}>
                    <h3 style={{ margin: 0, color: '#444' }}>Queue Metrics</h3>
                    <div style={styles.metricGrid}>
                        <div style={{
                            ...styles.metricCard,
                            gridColumn: '1 / -1',
                            backgroundColor: queueState.utilization > 80 ? '#fff3e0' : '#f1f8e9'
                        }}>
                            <div style={styles.metricLabel}>
                                <span>⚡</span>
                                <span>Worker Utilization</span>
                            </div>
                            <div style={{
                                ...styles.metricValue,
                                color: queueState.utilization > 80 ? '#f57c00' : '#4caf50'
                            }}>
                                {queueState.utilization.toFixed(1)}%
                            </div>
                            <div style={{
                                width: '100%',
                                height: '4px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '2px',
                                marginTop: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${queueState.utilization}%`,
                                    height: '100%',
                                    backgroundColor: queueState.utilization > 80 ? '#f57c00' : '#4caf50',
                                    transition: 'width 0.3s ease-in-out'
                                }} />
                            </div>
                        </div>
                        <div style={styles.metricCard}>
                            <div style={styles.metricLabel}>
                                <span>📊</span>
                                <span>Current Queue</span>
                            </div>
                            <div style={styles.metricValue}>{queueState.queuedJobs.length}</div>
                        </div>
                        <div style={styles.metricCard}>
                            <div style={styles.metricLabel}>
                                <span>📈</span>
                                <span>Peak Queue Size</span>
                            </div>
                            <div style={styles.metricValue}>{queueState.maxQueueSize}</div>
                        </div>
                        <div style={styles.metricCard}>
                            <div style={styles.metricLabel}>
                                <span>📦</span>
                                <span>Total Jobs</span>
                            </div>
                            <div style={styles.metricValue}>{queueState.totalJobs}</div>
                        </div>
                        <div style={styles.metricCard}>
                            <div style={styles.metricLabel}>
                                <span>⏱️</span>
                                <span>Avg Lead Time</span>
                            </div>
                            <div style={styles.metricValue}>
                                {(queueState.leadTimeMetrics.average / 1000).toFixed(1)}s
                            </div>
                        </div>
                        <div style={styles.metricCard}>
                            <div style={styles.metricLabel}>
                                <span>⏳</span>
                                <span>Max Lead Time</span>
                            </div>
                            <div style={styles.metricValue}>
                                {(queueState.leadTimeMetrics.max / 1000).toFixed(1)}s
                            </div>
                        </div>
                        <div style={styles.metricCard}>
                            <div style={styles.metricLabel}>
                                <span>✅</span>
                                <span>Completed Jobs</span>
                            </div>
                            <div style={styles.metricValue}>{queueState.leadTimeMetrics.completed}</div>
                        </div>
                    </div>
                </div>
                
                <div style={styles.configControls}>
                    <div style={styles.configItem}>
                        <label style={styles.label}>Min Processing Time (ms): {config.minProcessingTime}</label>
                        <input 
                            type="range"
                            style={styles.input} 
                            min="100" 
                            max="3000" 
                            value={config.minProcessingTime}
                            onChange={(e) => {
                                const newMin = parseInt(e.target.value);
                                setConfig(prev => ({
                                    ...prev,
                                    minProcessingTime: newMin,
                                    maxProcessingTime: Math.max(newMin, prev.maxProcessingTime)
                                }));
                            }}
                        />
                    </div>
                    
                    <div style={styles.configItem}>
                        <label style={styles.label}>Max Processing Time (ms): {config.maxProcessingTime}</label>
                        <input 
                            type="range"
                            style={styles.input} 
                            min="100" 
                            max="10000" 
                            value={config.maxProcessingTime}
                            onChange={(e) => {
                                const newMax = parseInt(e.target.value);
                                setConfig(prev => ({
                                    ...prev,
                                    maxProcessingTime: newMax,
                                    minProcessingTime: Math.min(newMax, prev.minProcessingTime)
                                }));
                            }}
                        />
                    </div>
                    
                    <div style={styles.configItem}>
                        <label style={styles.label}>Job Creation Interval (ms): {config.jobCreationInterval}</label>
                        <input 
                            type="range"
                            style={styles.input} 
                            min="500" 
                            max="5000" 
                            value={config.jobCreationInterval}
                            onChange={(e) => {
                                setConfig(prev => ({
                                    ...prev,
                                    jobCreationInterval: parseInt(e.target.value)
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={styles.queueStatus}>
                <h3>Queue Backlog</h3>
                <div style={styles.queuedJobs}>
                    {queueState.queuedJobs.map(job => (
                        <div key={job.id} style={styles.jobItem}>
                            <span>📦 Job {job.id}</span>
                            <span style={{ color: '#666' }}>({(job.processingTime / 1000).toFixed(1)}s)</span>
                        </div>
                    ))}
                    {queueState.queuedJobs.length === 0 && (
                        <div style={{ color: '#666', fontStyle: 'italic' }}>No jobs in queue</div>
                    )}
                </div>
            </div>

            <div style={styles.workersStatus}>
                <h3>Worker Status</h3>
                {queueState.workers.map(worker => {
                    const workerStyle = {
                        ...styles.worker,
                        ...(worker.busy ? styles.workerBusy : styles.workerIdle)
                    };
                    return (
                        <div key={worker.id} style={workerStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold' }}>
                                    {worker.busy ? '🔄' : '⏸️'} Worker {worker.id}
                                </div>
                                <div style={{ color: worker.busy ? '#4caf50' : '#9e9e9e' }}>
                                    {worker.busy ? 'Processing' : 'Idle'}
                                </div>
                            </div>
                            {worker.currentJob && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ marginBottom: '5px' }}>
                                        Processing Job {worker.currentJob.id}
                                        <span style={{ color: '#666', marginLeft: '8px' }}>
                                            ({(worker.currentJob.processingTime / 1000).toFixed(1)}s)
                                        </span>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div 
                                            style={{
                                                ...styles.progressFill,
                                                width: `${worker.getProgress()}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
