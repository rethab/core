import * as http from 'http';
import {Container} from 'inversify';

import {State} from '../../../state/state';
import {HttpHeaders, HttpStatusCode} from '../../http';

import {DefaultsHandler} from './defaults.handler';

import {createSpyObj} from 'jest-createspyobj';

describe('DefaultsHandler', () => {
    let container: Container;
    let handler: DefaultsHandler;
    let state: jest.Mocked<State>;

    beforeEach(() => {
        container = new Container();
        state = createSpyObj(State);

        container.bind('ActionHandler').to(DefaultsHandler);
        container.bind('BaseUrl').toConstantValue('/base-url');
        container.bind('State').toConstantValue(state);

        handler = container.get<DefaultsHandler>('ActionHandler');
    });

    describe('handle', () => {
        let nextFn: jest.Mock<Function>;
        let request: http.IncomingMessage;
        let response: http.ServerResponse;

        beforeEach(() => {
            nextFn = jest.fn();
            request = {} as http.IncomingMessage;
            response = {
                end: jest.fn(),
                writeHead: jest.fn()
            } as unknown as http.ServerResponse;
        });

        it('sets the defaults', () => {
            handler.handle(request as any, response as any, nextFn, {id: 'apimockId'});

            expect(state.setToDefaults).toHaveBeenCalledWith('apimockId');
            expect(response.writeHead).toHaveBeenCalledWith(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            expect(response.end).toHaveBeenCalled();
        });
    });

    describe('isApplicable', () => {
        let request: http.IncomingMessage;

        beforeEach(() => {
            request = {} as http.IncomingMessage;
        });

        it('indicates applicable when url and action match', () => {
            request.url = `${'/base-url'}/actions`;
            expect(handler.isApplicable(request as any, {action: 'defaults'})).toBe(true);
        });
        it('indicates not applicable when the action does not match', () => {
            request.url = `${'/base-url'}/actions`;
            expect(handler.isApplicable(request as any, {action: 'NO-MATCHING-ACTION'})).toBe(false);
        });
        it('indicates not applicable when the url does not match', () => {
            request.url = `${'/base-url'}/no-match`;
            expect(handler.isApplicable(request as any, {action: 'defaults'})).toBe(false);
        });
    });
});
