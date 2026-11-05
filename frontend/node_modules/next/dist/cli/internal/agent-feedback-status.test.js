"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _agentfeedbackstatus = require("./agent-feedback-status");
describe('isAgentFeedbackEnabled', ()=>{
    it('returns true only for an exact successful true response', async ()=>{
        let requestInit;
        const fetchImpl = async (_input, init)=>{
            requestInit = init;
            return new Response('true');
        };
        await expect((0, _agentfeedbackstatus.isAgentFeedbackEnabled)(fetchImpl)).resolves.toBe(true);
        expect(requestInit).toEqual(expect.objectContaining({
            cache: 'no-store'
        }));
        expect(requestInit == null ? void 0 : requestInit.signal).toBeInstanceOf(AbortSignal);
    });
    it.each([
        [
            'disabled',
            new Response('false')
        ],
        [
            'unexpected body',
            new Response(' true ')
        ],
        [
            'unsuccessful response',
            new Response('true', {
                status: 500
            })
        ]
    ])('returns false for an %s', async (_name, response)=>{
        const fetchImpl = async ()=>response;
        await expect((0, _agentfeedbackstatus.isAgentFeedbackEnabled)(fetchImpl)).resolves.toBe(false);
    });
    it('rejects when the request fails', async ()=>{
        const fetchImpl = async ()=>{
            throw new Error('network unavailable');
        };
        await expect((0, _agentfeedbackstatus.isAgentFeedbackEnabled)(fetchImpl)).rejects.toThrow('network unavailable');
    });
    it('rejects when the request times out', async ()=>{
        const fetchImpl = (_input, init)=>{
            return new Promise((_resolve, reject)=>{
                var _init_signal;
                init == null ? void 0 : (_init_signal = init.signal) == null ? void 0 : _init_signal.addEventListener('abort', ()=>{
                    reject(new Error('aborted'));
                });
            });
        };
        await expect((0, _agentfeedbackstatus.isAgentFeedbackEnabled)(fetchImpl, 1)).rejects.toThrow('aborted');
    });
});

//# sourceMappingURL=agent-feedback-status.test.js.map