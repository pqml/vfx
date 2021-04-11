// Faster bind than bind. Doesn't memoize tho
// Ref: https://github.com/primus/eventemitter3/blob/master/index.js
//      https://github.com/mcollina/fastbind/blob/master/bind.js

function bind(fn, ctx, argCount = 0) {
	if (typeof fn === 'string') fn = ctx[ fn ];
	if (argCount === 0) return function () {
		return fn.call(ctx);
	};
	else if (argCount === 1) return function (a) {
		return fn.call(ctx, a);
	};
	else if (argCount === 2) return function (a, b) {
		return fn.call(ctx, a, b);
	};
	else if (argCount === 3) return function (a, b, c) {
		return fn.call(ctx, a, b, c);
	};
	else if (argCount === 4) return function (a, b, c, d) {
		return fn.call(ctx, a, b, c, d);
	};
	else if (argCount === 5) return function (a, b, c, d, e) {
		return fn.call(ctx, a, b, c, d, e);
	};
	else throw new Error('Too many arguments');
}

// create a binder for a given instance
function binder(ctx) {
	return function (method, argCount = 0) {
		ctx[ method ] = bind(ctx[ method ], ctx, argCount);
		return ctx[ method ];
	};
}

export { bind, binder };
export default bind;
