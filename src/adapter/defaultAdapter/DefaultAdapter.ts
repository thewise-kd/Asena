import type { AsenaAdapter } from '../AsenaAdapter.ts';
import { type Context, Hono, type HonoRequest, type MiddlewareHandler, type Next } from 'hono';
import * as bun from 'bun';
import type { RouteParams } from '../types';
import { createFactory } from 'hono/factory';
import type { H } from 'hono/types';
import { DefaultContextWrapper } from './DefaultContextWrapper.ts';
import { HttpMethod } from '../../server/types/index.ts';
import type { BaseMiddleware } from '../../server/web/types';
import type { ErrorHandler, Handler } from './types/handler.ts';

export class DefaultAdapter implements AsenaAdapter<Hono, Handler, MiddlewareHandler, H> {

  public app = new Hono();

  protected port: number;

  public setPort(port: number) {
    this.port = port;
  }

  public use(middleware: BaseMiddleware<HonoRequest, Response>) {
    this.app.use(...this.prepareMiddlewares(middleware));
  }

  public registerRoute({ method, path, middleware, handler, staticServe }: RouteParams<MiddlewareHandler, H>) {
    const routeHandler = staticServe ? middleware : [...middleware, handler];

    switch (method) {
      case HttpMethod.GET:
        this.app.get(path, ...routeHandler);

        break;

      case HttpMethod.POST:
        this.app.post(path, ...routeHandler);

        break;

      case HttpMethod.PUT:
        this.app.put(path, ...routeHandler);

        break;

      case HttpMethod.DELETE:
        this.app.delete(path, ...routeHandler);

        break;

      case HttpMethod.PATCH:
        this.app.patch(path, ...routeHandler);

        break;

      case HttpMethod.OPTIONS:
        this.app.options(path, ...routeHandler);

        break;

      case HttpMethod.CONNECT:
        this.app.on(HttpMethod.CONNECT.toUpperCase(), path, ...routeHandler);

        break;

      case HttpMethod.HEAD:
        this.app.on(HttpMethod.HEAD.toUpperCase(), path, ...routeHandler);

        break;

      case HttpMethod.TRACE:
        this.app.on(HttpMethod.TRACE.toUpperCase(), path, ...routeHandler);

        break;

      default:
        throw new Error('Invalid method');
    }
  }

  public async start() {
    bun.serve({ port: this.port, fetch: this.app.fetch });
  }

  public prepareMiddlewares(
    middlewares: BaseMiddleware<HonoRequest, Response> | BaseMiddleware<HonoRequest, Response>[],
  ) {
    const _middlewares = Array.isArray(middlewares) ? middlewares : [middlewares];

    const factory = createFactory();

    return _middlewares.map((middleware) => {
      if (middleware.override) {
        return middleware.middlewareService.handle.bind(middleware.middlewareService);
      }

      return factory.createMiddleware(async (context: Context, next: Next) => {
        await middleware.middlewareService.handle(new DefaultContextWrapper(context), next);
      });
    });
  }

  public prepareHandler(handler: Handler) {
    return async function (context: Context) {
      return await handler(new DefaultContextWrapper(context));
    };
  }

  public onError(errorHandler: ErrorHandler) {
    this.app.onError((error, context) => {
      return errorHandler(error, new DefaultContextWrapper(context));
    });
  }

}
