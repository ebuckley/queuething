// Queue class to manage jobs
export class JobQueue {
    constructor() {
        this.jobs = [];
    }

    addJob(job) {
        this.jobs.push(job);
    }

    getNextJob() {
        return this.jobs.shift();
    }

    get length() {
        return this.jobs.length;
    }
}

// Job class to represent work items
export class Job {
    constructor(id) {
        this.id = id;
        // Random processing time between 1000ms and 5000ms
        this.processingTime = Math.floor(Math.random() * 4000) + 1000;
    }
}

// Worker class to process jobs
export class Worker {
    constructor(id, queue) {
        this.id = id;
        this.queue = queue;
        this.busy = false;
    }

    async processJob(job) {
        this.busy = true;
        console.log(`Worker ${this.id} started processing Job ${job.id} (Expected time: ${job.processingTime}ms)`);

        await new Promise(resolve => setTimeout(resolve, job.processingTime));

        console.log(`Worker ${this.id} completed Job ${job.id}`);
        this.busy = false;
        this.checkForWork();
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
    constructor(numWorkers) {
        this.queue = new JobQueue();
        this.workers = [];
        this.jobCounter = 0;

        // Create workers
        for (let i = 0; i < numWorkers; i++) {
            this.workers.push(new Worker(i, this.queue));
        }
    }

    start() {
        // Generate new jobs periodically
        setInterval(() => {
            this.generateJob();
        }, 2000); // Create a new job every 2 seconds

        // Regularly check for idle workers
        setInterval(() => {
            this.assignWork();
        }, 500);
    }

    generateJob() {
        const job = new Job(this.jobCounter++);
        this.queue.addJob(job);
        console.log(`New Job ${job.id} added to queue. Queue length: ${this.queue.length}`);
    }

    assignWork() {
        const availableWorkers = this.workers.filter(worker => !worker.busy);
        availableWorkers.forEach(worker => worker.checkForWork());
    }
    stop() {
        
    }
}