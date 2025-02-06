// Queue class to manage jobs
export class JobQueue {
    constructor(queueManager) {
        this.jobs = [];
        this.queueManager = queueManager;
    }

    addJob(job) {
        this.jobs.push(job);
        if (this.stateCallback) this.stateCallback();
    }

    getNextJob() {
        const job = this.jobs.shift();
        if (this.stateCallback) this.stateCallback();
        return job;
    }

    get length() {
        return this.jobs.length;
    }

    stop() {
        this.jobs = [];
        if (this.stateCallback) this.stateCallback();
    }
}

// Job class to represent work items
export class Job {
    constructor(id, config = {}) {
        this.id = id;
        const { minProcessingTime = 1000, maxProcessingTime = 5000 } = config;
        // Random processing time between minProcessingTime and maxProcessingTime
        this.processingTime = Math.floor(Math.random() * (maxProcessingTime - minProcessingTime)) + minProcessingTime;
        this.createdAt = Date.now();
        this.startedAt = null;
        this.completedAt = null;
    }
}

// Worker class to process jobs
export class Worker {
    constructor(id, queue, stateCallback, queueManager) {
        this.id = id;
        this.queue = queue;
        this.busy = false;
        this.stateCallback = stateCallback;
        this.queueManager = queueManager;
    }

    async processJob(job) {
        this.busy = true;
        this.currentJob = job;
        this.jobStartTime = Date.now();
        job.startedAt = Date.now();
        if (this.stateCallback) this.stateCallback();
        
        console.log(`Worker ${this.id} started processing Job ${job.id} (Expected time: ${job.processingTime}ms)`);

        const updateProgress = () => {
            const elapsed = Date.now() - this.jobStartTime;
            if (elapsed < job.processingTime && this.busy) {
                if (this.stateCallback) this.stateCallback();
                requestAnimationFrame(updateProgress);
            }
        };
        updateProgress();

        await new Promise(resolve => setTimeout(resolve, job.processingTime));

        // Update job completion metrics
        job.completedAt = Date.now();
        const leadTime = job.completedAt - job.createdAt;
        this.queueManager.updateLeadTimeMetrics(leadTime);

        console.log(`Worker ${this.id} completed Job ${job.id} (Lead time: ${leadTime}ms)`);
        this.busy = false;
        this.currentJob = null;
        this.jobStartTime = null;
        if (this.stateCallback) this.stateCallback();
        this.checkForWork();
    }

    getProgress() {
        if (!this.busy || !this.currentJob || !this.jobStartTime) return 0;
        const elapsed = Date.now() - this.jobStartTime;
        return Math.min(100, (elapsed / this.currentJob.processingTime) * 100);
    }

    checkForWork() {
        if (!this.busy && this.queue.length > 0) {
            const job = this.queue.getNextJob();
            if (job) {
                this.processJob(job);
            }
        }
    }
}

// QueueManager to orchestrate the system
export class QueueManager {
    constructor(numWorkers, stateCallback, config = {}) {
        this.stateCallback = stateCallback;
        this.queue = new JobQueue(this);
        this.queue.stateCallback = () => {
            // Update max queue size whenever queue changes
            this.maxQueueSize = Math.max(this.maxQueueSize, this.queue.length);
            this.stateCallback(this.getState());
        };
        this.workers = [];
        this.jobCounter = 0;
        this.running = false;
        this.jobCreationInterval = null;
        this.workerCheckInterval = null;
        this.maxQueueSize = 0;
        
        // Lead time tracking
        this.completedJobs = [];
        this.maxLeadTime = 0;
        this.totalLeadTime = 0;
        
        // Configuration with defaults
        this.config = {
            minProcessingTime: 1000,  // minimum job processing time in ms
            maxProcessingTime: 5000,  // maximum job processing time in ms
            jobCreationInterval: 2000, // time between new jobs in ms
            ...config
        };

        // Create workers
        for (let i = 0; i < numWorkers; i++) {
            this.workers.push(new Worker(i, this.queue, () => this.stateCallback(this.getState()), this));
        }
        this.stateCallback(this.getState());
    }

    start() {
        if (this.running) return;
        this.running = true;

        // Generate new jobs periodically
        this.jobCreationInterval = setInterval(() => {
            this.generateJob();
        }, this.config.jobCreationInterval);

        // Regularly check for idle workers
        this.workerCheckInterval = setInterval(() => {
            this.assignWork();
        }, 500);

        this.stateCallback(this.getState());
    }

    generateJob() {
        const job = new Job(this.jobCounter++, {
            minProcessingTime: this.config.minProcessingTime,
            maxProcessingTime: this.config.maxProcessingTime
        });
        this.queue.addJob(job);
        console.log(`New Job ${job.id} added to queue. Queue length: ${this.queue.length}`);
    }

    assignWork() {
        const availableWorkers = this.workers.filter(worker => !worker.busy);
        availableWorkers.forEach(worker => worker.checkForWork());
    }
    updateLeadTimeMetrics(leadTime) {
        this.maxLeadTime = Math.max(this.maxLeadTime, leadTime);
        this.totalLeadTime += leadTime;
        this.completedJobs.push(leadTime);
        this.stateCallback(this.getState());
    }

    stop() {
        if (!this.running) return;
        this.running = false;

        // Clear intervals
        if (this.jobCreationInterval) {
            clearInterval(this.jobCreationInterval);
            this.jobCreationInterval = null;
        }
        if (this.workerCheckInterval) {
            clearInterval(this.workerCheckInterval);
            this.workerCheckInterval = null;
        }
        this.queue.stop();
        // Reset metrics when stopping
        this.maxQueueSize = 0;
        this.maxLeadTime = 0;
        this.totalLeadTime = 0;
        this.completedJobs = [];
        this.stateCallback(this.getState());
    }
    getState() {
        const avgLeadTime = this.completedJobs.length > 0 
            ? this.totalLeadTime / this.completedJobs.length 
            : 0;

        return {
            isRunning: this.running,
            queuedJobs: this.queue.jobs,
            workers: this.workers,
            totalJobs: this.jobCounter,
            maxQueueSize: this.maxQueueSize,
            leadTimeMetrics: {
                max: this.maxLeadTime,
                average: avgLeadTime,
                completed: this.completedJobs.length
            }
        }
    }
}