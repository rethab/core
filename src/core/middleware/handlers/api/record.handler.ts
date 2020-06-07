import * as http from 'http';
import {inject, injectable} from 'inversify';

import {State} from '../../../state/state';
import {HttpHeaders, HttpStatusCode} from '../../http';
import {ApplicableHandler} from '../handler';

/**  Record handler. */
@injectable()
export class RecordHandler implements ApplicableHandler {
    /**
     * Constructor.
     * @param {string} baseUrl The base url.
     * @param {State} state The state.
     */
    constructor(@inject('BaseUrl') private baseUrl: string,
                @inject('State') private state: State) {
    }

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {
        id: string, body: { record?: boolean }
    }): void {
        this.state.getMatchingState(params.id).record = params.body.record;
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }

    /** {@inheritDoc}.*/
    isApplicable(request: http.IncomingMessage, body: any): boolean {
        const urlMatches = request.url.startsWith(`${this.baseUrl}/actions`);
        const actionMatches = body !== undefined && body.action === 'record';
        return urlMatches && actionMatches;
    }
}
