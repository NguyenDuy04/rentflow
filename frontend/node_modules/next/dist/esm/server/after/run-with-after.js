import { createPromiseWithResolvers } from '../../shared/lib/promise-with-resolvers';
import { CloseController } from '../web/web-on-close';
import { AwaiterOnce } from './awaiter';
export class AfterRunner {
    async executeAfter() {
        this.closeController.dispatchClose();
        await this.awaiter.awaiting();
        // if we got an error while running the callbacks,
        // thenthis is a noop, because the promise is already rejected
        this.finishedWithoutErrors.resolve();
        return this.finishedWithoutErrors.promise;
    }
    constructor(){
        this.awaiter = new AwaiterOnce();
        this.closeController = new CloseController();
        this.finishedWithoutErrors = createPromiseWithResolvers();
        this.context = {
            waitUntil: this.awaiter.waitUntil.bind(this.awaiter),
            onClose: this.closeController.onClose.bind(this.closeController),
            onTaskError: (error)=>this.finishedWithoutErrors.reject(error)
        };
    }
}

//# sourceMappingURL=run-with-after.js.map