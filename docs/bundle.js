
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var derpament = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const tournaments = writable([]);
    const tournament = writable(null);
    const stage = writable(null);

    /* frontend\components\organisms\Header.svelte generated by Svelte v3.23.1 */
    const file = "frontend\\components\\organisms\\Header.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text("< Back");
    			t1 = space();
    			input = element("input");
    			attr_dev(a, "href", /*backHref*/ ctx[0]);
    			add_location(a, file, 20, 4, 417);
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "Filter on players");
    			attr_dev(input, "class", "svelte-g01nhw");
    			add_location(input, file, 21, 4, 460);
    			attr_dev(div0, "class", "inner svelte-g01nhw");
    			add_location(div0, file, 19, 2, 392);
    			attr_dev(div1, "class", "root svelte-g01nhw");
    			add_location(div1, file, 18, 0, 370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div0, t1);
    			append_dev(div0, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*handleSearch*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*backHref*/ 1) {
    				attr_dev(a, "href", /*backHref*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { backHref } = $$props;
    	let timeout;

    	function handleSearch($event) {
    		// 500 ms debounce
    		if (timeout) clearTimeout(timeout);

    		timeout = setTimeout(() => dispatch("search", $event.target.value), 500);
    	}

    	const writable_props = ["backHref"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);

    	$$self.$set = $$props => {
    		if ("backHref" in $$props) $$invalidate(0, backHref = $$props.backHref);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		backHref,
    		timeout,
    		handleSearch
    	});

    	$$self.$inject_state = $$props => {
    		if ("backHref" in $$props) $$invalidate(0, backHref = $$props.backHref);
    		if ("timeout" in $$props) timeout = $$props.timeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [backHref, handleSearch];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { backHref: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*backHref*/ ctx[0] === undefined && !("backHref" in props)) {
    			console.warn("<Header> was created without expected prop 'backHref'");
    		}
    	}

    	get backHref() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backHref(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\RollRow.svelte generated by Svelte v3.23.1 */

    const file$1 = "frontend\\components\\molecules\\RollRow.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let a;
    	let t2_value = /*player*/ ctx[0].name + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let div1;
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*index*/ ctx[2]);
    			t1 = text(".\r\n    ");
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text(/*roll*/ ctx[1]);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 9, 4, 146);
    			attr_dev(div0, "class", "name svelte-22sxgw");
    			add_location(div0, file$1, 7, 2, 108);
    			attr_dev(div1, "class", "roll svelte-22sxgw");
    			add_location(div1, file$1, 13, 2, 257);
    			attr_dev(div2, "class", "root svelte-22sxgw");
    			add_location(div2, file$1, 6, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 4) set_data_dev(t0, /*index*/ ctx[2]);
    			if (dirty & /*player*/ 1 && t2_value !== (t2_value = /*player*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*player*/ 1 && a_href_value !== (a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*roll*/ 2) set_data_dev(t4, /*roll*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { player } = $$props;
    	let { roll } = $$props;
    	let { index } = $$props;
    	const writable_props = ["player", "roll", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RollRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RollRow", $$slots, []);

    	$$self.$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("roll" in $$props) $$invalidate(1, roll = $$props.roll);
    		if ("index" in $$props) $$invalidate(2, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({ player, roll, index });

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("roll" in $$props) $$invalidate(1, roll = $$props.roll);
    		if ("index" in $$props) $$invalidate(2, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, roll, index];
    }

    class RollRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { player: 0, roll: 1, index: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RollRow",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
    			console.warn("<RollRow> was created without expected prop 'player'");
    		}

    		if (/*roll*/ ctx[1] === undefined && !("roll" in props)) {
    			console.warn("<RollRow> was created without expected prop 'roll'");
    		}

    		if (/*index*/ ctx[2] === undefined && !("index" in props)) {
    			console.warn("<RollRow> was created without expected prop 'index'");
    		}
    	}

    	get player() {
    		throw new Error("<RollRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<RollRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get roll() {
    		throw new Error("<RollRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roll(value) {
    		throw new Error("<RollRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<RollRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<RollRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\organisms\RollList.svelte generated by Svelte v3.23.1 */

    const { Object: Object_1 } = globals;
    const file$2 = "frontend\\components\\organisms\\RollList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (35:2) {#if displayRolls}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*rollsArray*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "rolls svelte-wqk9m7");
    			add_location(div, file$2, 35, 4, 916);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rollsArray, filter*/ 5) {
    				each_value = /*rollsArray*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(35:2) {#if displayRolls}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if !filter || roll.player.name.toLowerCase().includes(filter.toLowerCase())}
    function create_if_block_1(ctx) {
    	let current;

    	const rollrow = new RollRow({
    			props: {
    				index: /*roll*/ ctx[9].index,
    				player: /*roll*/ ctx[9].player,
    				roll: /*roll*/ ctx[9].value
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(rollrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rollrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const rollrow_changes = {};
    			if (dirty & /*rollsArray*/ 4) rollrow_changes.index = /*roll*/ ctx[9].index;
    			if (dirty & /*rollsArray*/ 4) rollrow_changes.player = /*roll*/ ctx[9].player;
    			if (dirty & /*rollsArray*/ 4) rollrow_changes.roll = /*roll*/ ctx[9].value;
    			rollrow.$set(rollrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rollrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rollrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rollrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(38:8) {#if !filter || roll.player.name.toLowerCase().includes(filter.toLowerCase())}",
    		ctx
    	});

    	return block;
    }

    // (37:6) {#each rollsArray as roll}
    function create_each_block(ctx) {
    	let show_if = !/*filter*/ ctx[0] || /*roll*/ ctx[9].player.name.toLowerCase().includes(/*filter*/ ctx[0].toLowerCase());
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filter, rollsArray*/ 5) show_if = !/*filter*/ ctx[0] || /*roll*/ ctx[9].player.name.toLowerCase().includes(/*filter*/ ctx[0].toLowerCase());

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*filter, rollsArray*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(37:6) {#each rollsArray as roll}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button;
    	let t0_value = (/*displayRolls*/ ctx[1] ? "Hide" : "Show") + "";
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*displayRolls*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = text(" rolls");
    			t2 = space();
    			if (if_block) if_block.c();
    			add_location(button, file$2, 33, 2, 809);
    			attr_dev(div, "class", "root");
    			add_location(div, file$2, 32, 0, 787);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleToggle*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*displayRolls*/ 2) && t0_value !== (t0_value = (/*displayRolls*/ ctx[1] ? "Hide" : "Show") + "")) set_data_dev(t0, t0_value);

    			if (/*displayRolls*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*displayRolls*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { players } = $$props;
    	let { rolls } = $$props;
    	let { filter } = $$props;
    	let displayRolls = true;
    	let rollsArray = [];
    	let count = 0;
    	let sum = 0;

    	Object.keys(rolls).forEach(playerId => {
    		rolls[playerId].forEach(roll => {
    			++count;
    			sum += roll;
    			rollsArray.push({ player: players[playerId], value: roll });
    		});
    	});

    	const average = (sum / count).toFixed(2);
    	rollsArray = rollsArray.sort((a, b) => a.value < b.value ? 1 : -1);

    	rollsArray.forEach((roll, i) => {
    		roll.index = i && rollsArray[i - 1].value === roll.value
    		? rollsArray[i - 1].index
    		: i + 1;
    	});

    	function handleToggle() {
    		$$invalidate(1, displayRolls = !displayRolls);
    	}

    	const writable_props = ["players", "rolls", "filter"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RollList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RollList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("players" in $$props) $$invalidate(4, players = $$props.players);
    		if ("rolls" in $$props) $$invalidate(5, rolls = $$props.rolls);
    		if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
    	};

    	$$self.$capture_state = () => ({
    		RollRow,
    		players,
    		rolls,
    		filter,
    		displayRolls,
    		rollsArray,
    		count,
    		sum,
    		average,
    		handleToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(4, players = $$props.players);
    		if ("rolls" in $$props) $$invalidate(5, rolls = $$props.rolls);
    		if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
    		if ("displayRolls" in $$props) $$invalidate(1, displayRolls = $$props.displayRolls);
    		if ("rollsArray" in $$props) $$invalidate(2, rollsArray = $$props.rollsArray);
    		if ("count" in $$props) count = $$props.count;
    		if ("sum" in $$props) sum = $$props.sum;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [filter, displayRolls, rollsArray, handleToggle, players, rolls];
    }

    class RollList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { players: 4, rolls: 5, filter: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RollList",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[4] === undefined && !("players" in props)) {
    			console.warn("<RollList> was created without expected prop 'players'");
    		}

    		if (/*rolls*/ ctx[5] === undefined && !("rolls" in props)) {
    			console.warn("<RollList> was created without expected prop 'rolls'");
    		}

    		if (/*filter*/ ctx[0] === undefined && !("filter" in props)) {
    			console.warn("<RollList> was created without expected prop 'filter'");
    		}
    	}

    	get players() {
    		throw new Error("<RollList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<RollList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rolls() {
    		throw new Error("<RollList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rolls(value) {
    		throw new Error("<RollList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filter() {
    		throw new Error("<RollList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<RollList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\QualifiersRow.svelte generated by Svelte v3.23.1 */

    const file$3 = "frontend\\components\\molecules\\QualifiersRow.svelte";

    function create_fragment$3(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let t1;
    	let a;
    	let t2_value = /*player*/ ctx[0].name + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let div3;
    	let div1;
    	let t4;
    	let t5;
    	let t6;
    	let div2;
    	let t7;
    	let t8_value = /*ranks*/ ctx[2].join(", ") + "";
    	let t8;
    	let t9;
    	let div4;
    	let t10;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = text(/*index*/ ctx[4]);
    			t1 = text(".\r\n    ");
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t4 = text("Sum of scores: ");
    			t5 = text(/*totalScore*/ ctx[3]);
    			t6 = space();
    			div2 = element("div");
    			t7 = text("Ranks: ");
    			t8 = text(t8_value);
    			t9 = space();
    			div4 = element("div");
    			t10 = text(/*totalRank*/ ctx[1]);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 11, 4, 198);
    			attr_dev(div0, "class", "name svelte-1k0oiei");
    			add_location(div0, file$3, 9, 2, 160);
    			attr_dev(div1, "class", "combo");
    			add_location(div1, file$3, 16, 4, 333);
    			attr_dev(div2, "class", "counts svelte-1k0oiei");
    			add_location(div2, file$3, 17, 4, 391);
    			attr_dev(div3, "class", "info svelte-1k0oiei");
    			add_location(div3, file$3, 15, 2, 309);
    			attr_dev(div4, "class", "score svelte-1k0oiei");
    			add_location(div4, file$3, 21, 2, 470);
    			attr_dev(div5, "class", "root svelte-1k0oiei");
    			add_location(div5, file$3, 8, 0, 138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, t7);
    			append_dev(div2, t8);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 16) set_data_dev(t0, /*index*/ ctx[4]);
    			if (dirty & /*player*/ 1 && t2_value !== (t2_value = /*player*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*player*/ 1 && a_href_value !== (a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*totalScore*/ 8) set_data_dev(t5, /*totalScore*/ ctx[3]);
    			if (dirty & /*ranks*/ 4 && t8_value !== (t8_value = /*ranks*/ ctx[2].join(", ") + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*totalRank*/ 2) set_data_dev(t10, /*totalRank*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { player } = $$props;
    	let { totalRank } = $$props;
    	let { ranks } = $$props;
    	let { totalScore } = $$props;
    	let { index } = $$props;
    	const writable_props = ["player", "totalRank", "ranks", "totalScore", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QualifiersRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("QualifiersRow", $$slots, []);

    	$$self.$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("totalRank" in $$props) $$invalidate(1, totalRank = $$props.totalRank);
    		if ("ranks" in $$props) $$invalidate(2, ranks = $$props.ranks);
    		if ("totalScore" in $$props) $$invalidate(3, totalScore = $$props.totalScore);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		player,
    		totalRank,
    		ranks,
    		totalScore,
    		index
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("totalRank" in $$props) $$invalidate(1, totalRank = $$props.totalRank);
    		if ("ranks" in $$props) $$invalidate(2, ranks = $$props.ranks);
    		if ("totalScore" in $$props) $$invalidate(3, totalScore = $$props.totalScore);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, totalRank, ranks, totalScore, index];
    }

    class QualifiersRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			player: 0,
    			totalRank: 1,
    			ranks: 2,
    			totalScore: 3,
    			index: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QualifiersRow",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
    			console.warn("<QualifiersRow> was created without expected prop 'player'");
    		}

    		if (/*totalRank*/ ctx[1] === undefined && !("totalRank" in props)) {
    			console.warn("<QualifiersRow> was created without expected prop 'totalRank'");
    		}

    		if (/*ranks*/ ctx[2] === undefined && !("ranks" in props)) {
    			console.warn("<QualifiersRow> was created without expected prop 'ranks'");
    		}

    		if (/*totalScore*/ ctx[3] === undefined && !("totalScore" in props)) {
    			console.warn("<QualifiersRow> was created without expected prop 'totalScore'");
    		}

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<QualifiersRow> was created without expected prop 'index'");
    		}
    	}

    	get player() {
    		throw new Error("<QualifiersRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<QualifiersRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalRank() {
    		throw new Error("<QualifiersRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalRank(value) {
    		throw new Error("<QualifiersRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ranks() {
    		throw new Error("<QualifiersRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ranks(value) {
    		throw new Error("<QualifiersRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get totalScore() {
    		throw new Error("<QualifiersRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalScore(value) {
    		throw new Error("<QualifiersRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<QualifiersRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<QualifiersRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\organisms\QualifiersList.svelte generated by Svelte v3.23.1 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "frontend\\components\\organisms\\QualifiersList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (76:2) {#if displayScores}
    function create_if_block$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*rankedPlayers*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "scores svelte-106ytg1");
    			add_location(div, file$4, 76, 4, 2454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rankedPlayers, filter*/ 9) {
    				each_value = /*rankedPlayers*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(76:2) {#if displayScores}",
    		ctx
    	});

    	return block;
    }

    // (79:8) {#if !filter || row.player.name.toLowerCase().includes(filter.toLowerCase())}
    function create_if_block_1$1(ctx) {
    	let current;
    	const qualifiersrow_spread_levels = [{ index: /*i*/ ctx[12] + 1 }, /*row*/ ctx[10]];
    	let qualifiersrow_props = {};

    	for (let i = 0; i < qualifiersrow_spread_levels.length; i += 1) {
    		qualifiersrow_props = assign(qualifiersrow_props, qualifiersrow_spread_levels[i]);
    	}

    	const qualifiersrow = new QualifiersRow({
    			props: qualifiersrow_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(qualifiersrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(qualifiersrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const qualifiersrow_changes = (dirty & /*rankedPlayers*/ 8)
    			? get_spread_update(qualifiersrow_spread_levels, [qualifiersrow_spread_levels[0], get_spread_object(/*row*/ ctx[10])])
    			: {};

    			qualifiersrow.$set(qualifiersrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(qualifiersrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(qualifiersrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(qualifiersrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(79:8) {#if !filter || row.player.name.toLowerCase().includes(filter.toLowerCase())}",
    		ctx
    	});

    	return block;
    }

    // (78:6) {#each rankedPlayers as row, i}
    function create_each_block$1(ctx) {
    	let show_if = !/*filter*/ ctx[0] || /*row*/ ctx[10].player.name.toLowerCase().includes(/*filter*/ ctx[0].toLowerCase());
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filter*/ 1) show_if = !/*filter*/ ctx[0] || /*row*/ ctx[10].player.name.toLowerCase().includes(/*filter*/ ctx[0].toLowerCase());

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*filter*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(78:6) {#each rankedPlayers as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let b;

    	let t1_value = (/*average*/ ctx[2]
    	? /*average*/ ctx[2].toFixed(0)
    	: "N/A") + "";

    	let t1;
    	let t2;
    	let button;
    	let t3_value = (/*displayScores*/ ctx[1] ? "Hide" : "Show") + "";
    	let t3;
    	let t4;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*displayScores*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Average score: ");
    			b = element("b");
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			t3 = text(t3_value);
    			t4 = text(" scores");
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(b, file$4, 71, 21, 2273);
    			attr_dev(div0, "class", "average");
    			add_location(div0, file$4, 70, 4, 2229);
    			attr_dev(div1, "class", "stats svelte-106ytg1");
    			add_location(div1, file$4, 69, 2, 2204);
    			add_location(button, file$4, 74, 2, 2344);
    			attr_dev(div2, "class", "root");
    			add_location(div2, file$4, 68, 0, 2182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, b);
    			append_dev(b, t1);
    			append_dev(div2, t2);
    			append_dev(div2, button);
    			append_dev(button, t3);
    			append_dev(button, t4);
    			append_dev(div2, t5);
    			if (if_block) if_block.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleToggle*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*average*/ 4) && t1_value !== (t1_value = (/*average*/ ctx[2]
    			? /*average*/ ctx[2].toFixed(0)
    			: "N/A") + "")) set_data_dev(t1, t1_value);

    			if ((!current || dirty & /*displayScores*/ 2) && t3_value !== (t3_value = (/*displayScores*/ ctx[1] ? "Hide" : "Show") + "")) set_data_dev(t3, t3_value);

    			if (/*displayScores*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*displayScores*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { players } = $$props;
    	let { maps } = $$props;
    	let { filter } = $$props;
    	let displayScores = true;
    	const playerScores = {};
    	const rankedPlayersPerMap = {};
    	let average = 0;
    	let nbScores = 0;

    	maps.forEach(map => {
    		rankedPlayersPerMap[map.beatmapId] = [];

    		// Compile player ranks and total scores
    		map.scores.forEach(score => {
    			// Ignore scores from non-tournament players
    			if (!players[score.userId]) return;

    			// The scores are already sorted beforehand,
    			// so the pushed player scores should also end up sorted for the map
    			if (!playerScores[score.userId]) {
    				playerScores[score.userId] = {
    					player: players[score.userId],
    					totalScore: 0,
    					scores: []
    				};
    			}

    			if (!rankedPlayersPerMap[map.beatmapId].includes(score.userId)) {
    				rankedPlayersPerMap[map.beatmapId].push(score.userId);
    			}

    			$$invalidate(2, average += score.score);
    			playerScores[score.userId].scores.push(score);
    			playerScores[score.userId].totalScore += score.score;
    		});

    		nbScores += map.scores.length;
    	});

    	average /= nbScores;

    	// Tally ranks per map
    	Object.keys(playerScores).forEach(userId => {
    		playerScores[userId].ranks = [];
    		playerScores[userId].totalRank = 0;

    		// If a rank 0 is detected, remove the player from the seeding,
    		// as their qualifiers is incomplete and therefore invalid
    		let hasEmpty = false;

    		maps.forEach(map => {
    			if (hasEmpty) return;
    			const rank = rankedPlayersPerMap[map.beatmapId].indexOf(userId) + 1;
    			if (!rank) hasEmpty = true;
    			playerScores[userId].ranks.push(rank);
    			playerScores[userId].totalRank += rank;
    		});

    		if (hasEmpty) delete playerScores[userId];
    	});

    	const rankedPlayers = Object.values(playerScores).sort((a, b) => {
    		if (a.totalRank == b.totalRank) {
    			return a.totalScore < b.totalScore ? -1 : 1;
    		}

    		
    		return a.totalRank < b.totalRank ? -1 : 1;
    	});

    	function handleToggle() {
    		$$invalidate(1, displayScores = !displayScores);
    	}

    	const writable_props = ["players", "maps", "filter"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QualifiersList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("QualifiersList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("players" in $$props) $$invalidate(5, players = $$props.players);
    		if ("maps" in $$props) $$invalidate(6, maps = $$props.maps);
    		if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
    	};

    	$$self.$capture_state = () => ({
    		QualifiersRow,
    		players,
    		maps,
    		filter,
    		displayScores,
    		playerScores,
    		rankedPlayersPerMap,
    		average,
    		nbScores,
    		rankedPlayers,
    		handleToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(5, players = $$props.players);
    		if ("maps" in $$props) $$invalidate(6, maps = $$props.maps);
    		if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
    		if ("displayScores" in $$props) $$invalidate(1, displayScores = $$props.displayScores);
    		if ("average" in $$props) $$invalidate(2, average = $$props.average);
    		if ("nbScores" in $$props) nbScores = $$props.nbScores;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [filter, displayScores, average, rankedPlayers, handleToggle, players, maps];
    }

    class QualifiersList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { players: 5, maps: 6, filter: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QualifiersList",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[5] === undefined && !("players" in props)) {
    			console.warn("<QualifiersList> was created without expected prop 'players'");
    		}

    		if (/*maps*/ ctx[6] === undefined && !("maps" in props)) {
    			console.warn("<QualifiersList> was created without expected prop 'maps'");
    		}

    		if (/*filter*/ ctx[0] === undefined && !("filter" in props)) {
    			console.warn("<QualifiersList> was created without expected prop 'filter'");
    		}
    	}

    	get players() {
    		throw new Error("<QualifiersList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<QualifiersList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maps() {
    		throw new Error("<QualifiersList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maps(value) {
    		throw new Error("<QualifiersList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filter() {
    		throw new Error("<QualifiersList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<QualifiersList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\ScoreRow.svelte generated by Svelte v3.23.1 */

    const file$5 = "frontend\\components\\molecules\\ScoreRow.svelte";

    function create_fragment$5(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let t1;
    	let a;
    	let t2_value = /*player*/ ctx[0].name + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let div3;
    	let div1;
    	let t4_value = /*accuracy*/ ctx[5].toFixed(2) + "";
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div2;
    	let t9_value = /*counts*/ ctx[3].max + "";
    	let t9;
    	let t10;
    	let t11_value = /*counts*/ ctx[3][300] + "";
    	let t11;
    	let t12;
    	let t13_value = /*counts*/ ctx[3][200] + "";
    	let t13;
    	let t14;
    	let t15_value = /*counts*/ ctx[3][100] + "";
    	let t15;
    	let t16;
    	let t17_value = /*counts*/ ctx[3][50] + "";
    	let t17;
    	let t18;
    	let t19_value = /*counts*/ ctx[3].miss + "";
    	let t19;
    	let t20;
    	let div4;
    	let t21_value = /*score*/ ctx[1].toLocaleString() + "";
    	let t21;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = text(/*index*/ ctx[4]);
    			t1 = text(".\r\n    ");
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t4 = text(t4_value);
    			t5 = text("%, ");
    			t6 = text(/*combo*/ ctx[2]);
    			t7 = text(" combo");
    			t8 = space();
    			div2 = element("div");
    			t9 = text(t9_value);
    			t10 = text(" |\r\n      ");
    			t11 = text(t11_value);
    			t12 = text(" |\r\n      ");
    			t13 = text(t13_value);
    			t14 = text(" |\r\n      ");
    			t15 = text(t15_value);
    			t16 = text(" |\r\n      ");
    			t17 = text(t17_value);
    			t18 = text(" |\r\n      ");
    			t19 = text(t19_value);
    			t20 = space();
    			div4 = element("div");
    			t21 = text(t21_value);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 20, 4, 475);
    			attr_dev(div0, "class", "name svelte-1k0oiei");
    			add_location(div0, file$5, 18, 2, 437);
    			attr_dev(div1, "class", "combo");
    			add_location(div1, file$5, 25, 4, 610);
    			attr_dev(div2, "class", "counts svelte-1k0oiei");
    			add_location(div2, file$5, 26, 4, 678);
    			attr_dev(div3, "class", "info svelte-1k0oiei");
    			add_location(div3, file$5, 24, 2, 586);
    			attr_dev(div4, "class", "score svelte-1k0oiei");
    			add_location(div4, file$5, 35, 2, 858);
    			attr_dev(div5, "class", "root svelte-1k0oiei");
    			add_location(div5, file$5, 17, 0, 415);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, t7);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div2, t11);
    			append_dev(div2, t12);
    			append_dev(div2, t13);
    			append_dev(div2, t14);
    			append_dev(div2, t15);
    			append_dev(div2, t16);
    			append_dev(div2, t17);
    			append_dev(div2, t18);
    			append_dev(div2, t19);
    			append_dev(div5, t20);
    			append_dev(div5, div4);
    			append_dev(div4, t21);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 16) set_data_dev(t0, /*index*/ ctx[4]);
    			if (dirty & /*player*/ 1 && t2_value !== (t2_value = /*player*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*player*/ 1 && a_href_value !== (a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*combo*/ 4) set_data_dev(t6, /*combo*/ ctx[2]);
    			if (dirty & /*counts*/ 8 && t9_value !== (t9_value = /*counts*/ ctx[3].max + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*counts*/ 8 && t11_value !== (t11_value = /*counts*/ ctx[3][300] + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*counts*/ 8 && t13_value !== (t13_value = /*counts*/ ctx[3][200] + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*counts*/ 8 && t15_value !== (t15_value = /*counts*/ ctx[3][100] + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*counts*/ 8 && t17_value !== (t17_value = /*counts*/ ctx[3][50] + "")) set_data_dev(t17, t17_value);
    			if (dirty & /*counts*/ 8 && t19_value !== (t19_value = /*counts*/ ctx[3].miss + "")) set_data_dev(t19, t19_value);
    			if (dirty & /*score*/ 2 && t21_value !== (t21_value = /*score*/ ctx[1].toLocaleString() + "")) set_data_dev(t21, t21_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { player } = $$props;
    	let { score } = $$props;
    	let { combo } = $$props;
    	let { counts } = $$props;
    	let { index } = $$props;
    	const totalCount = counts.max + counts[300] + counts[200] + counts[100] + counts[50] + counts.miss;
    	const accuracy = (305 * counts.max + 300 * counts[300] + 200 * counts[200] + 100 * counts[100] + 50 * counts[50]) / (3.05 * totalCount);
    	const writable_props = ["player", "score", "combo", "counts", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScoreRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScoreRow", $$slots, []);

    	$$self.$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("score" in $$props) $$invalidate(1, score = $$props.score);
    		if ("combo" in $$props) $$invalidate(2, combo = $$props.combo);
    		if ("counts" in $$props) $$invalidate(3, counts = $$props.counts);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		player,
    		score,
    		combo,
    		counts,
    		index,
    		totalCount,
    		accuracy
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("score" in $$props) $$invalidate(1, score = $$props.score);
    		if ("combo" in $$props) $$invalidate(2, combo = $$props.combo);
    		if ("counts" in $$props) $$invalidate(3, counts = $$props.counts);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, score, combo, counts, index, accuracy];
    }

    class ScoreRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			player: 0,
    			score: 1,
    			combo: 2,
    			counts: 3,
    			index: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreRow",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
    			console.warn("<ScoreRow> was created without expected prop 'player'");
    		}

    		if (/*score*/ ctx[1] === undefined && !("score" in props)) {
    			console.warn("<ScoreRow> was created without expected prop 'score'");
    		}

    		if (/*combo*/ ctx[2] === undefined && !("combo" in props)) {
    			console.warn("<ScoreRow> was created without expected prop 'combo'");
    		}

    		if (/*counts*/ ctx[3] === undefined && !("counts" in props)) {
    			console.warn("<ScoreRow> was created without expected prop 'counts'");
    		}

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<ScoreRow> was created without expected prop 'index'");
    		}
    	}

    	get player() {
    		throw new Error("<ScoreRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<ScoreRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get score() {
    		throw new Error("<ScoreRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set score(value) {
    		throw new Error("<ScoreRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get combo() {
    		throw new Error("<ScoreRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set combo(value) {
    		throw new Error("<ScoreRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counts() {
    		throw new Error("<ScoreRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counts(value) {
    		throw new Error("<ScoreRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<ScoreRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ScoreRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\organisms\ScoreList.svelte generated by Svelte v3.23.1 */

    const { Object: Object_1$2 } = globals;
    const file$6 = "frontend\\components\\organisms\\ScoreList.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i].player;
    	child_ctx[5] = list[i].scores;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (59:4) {#if bans}
    function create_if_block_4(ctx) {
    	let div0;
    	let t0;
    	let b0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5_value = (100 * /*pickCount*/ ctx[2] / /*matchCount*/ ctx[3]).toFixed(2) + "";
    	let t5;
    	let t6;
    	let t7;
    	let div1;
    	let t8;
    	let b1;
    	let t9_value = /*bans*/ ctx[1].length + "";
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13_value = (100 * /*bans*/ ctx[1].length / /*matchCount*/ ctx[3]).toFixed(2) + "";
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let div2;
    	let t17;
    	let b2;
    	let t18_value = /*bans*/ ctx[1].length + /*pickCount*/ ctx[2] + "";
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22_value = (100 * (/*bans*/ ctx[1].length + /*pickCount*/ ctx[2]) / /*matchCount*/ ctx[3]).toFixed(2) + "";
    	let t22;
    	let t23;
    	let if_block = /*bans*/ ctx[1].length && create_if_block_6(ctx);
    	let each_value_2 = Object.keys(/*groupedBans*/ ctx[9]);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Picked ");
    			b0 = element("b");
    			t1 = text(/*pickCount*/ ctx[2]);
    			t2 = text("/");
    			t3 = text(/*matchCount*/ ctx[3]);
    			t4 = text(" (");
    			t5 = text(t5_value);
    			t6 = text("%) times");
    			t7 = space();
    			div1 = element("div");
    			t8 = text("Banned ");
    			b1 = element("b");
    			t9 = text(t9_value);
    			t10 = text("/");
    			t11 = text(/*matchCount*/ ctx[3]);
    			t12 = text("\r\n        (");
    			t13 = text(t13_value);
    			t14 = text("%)\r\n        times");
    			if (if_block) if_block.c();
    			t15 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			div2 = element("div");
    			t17 = text("Relevancy: ");
    			b2 = element("b");
    			t18 = text(t18_value);
    			t19 = text("/");
    			t20 = text(/*matchCount*/ ctx[3]);
    			t21 = text(" (");
    			t22 = text(t22_value);
    			t23 = text("%)");
    			add_location(b0, file$6, 60, 15, 1616);
    			attr_dev(div0, "class", "picks");
    			add_location(div0, file$6, 59, 6, 1580);
    			add_location(b1, file$6, 63, 15, 1757);
    			attr_dev(div1, "class", "bans");
    			add_location(div1, file$6, 62, 6, 1722);
    			add_location(b2, file$6, 75, 19, 2321);
    			attr_dev(div2, "class", "relevancy");
    			add_location(div2, file$6, 74, 6, 2277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, b0);
    			append_dev(b0, t1);
    			append_dev(b0, t2);
    			append_dev(b0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t8);
    			append_dev(div1, b1);
    			append_dev(b1, t9);
    			append_dev(b1, t10);
    			append_dev(b1, t11);
    			append_dev(div1, t12);
    			append_dev(div1, t13);
    			append_dev(div1, t14);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t15);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t16, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t17);
    			append_dev(div2, b2);
    			append_dev(b2, t18);
    			append_dev(b2, t19);
    			append_dev(b2, t20);
    			append_dev(div2, t21);
    			append_dev(div2, t22);
    			append_dev(div2, t23);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pickCount*/ 4) set_data_dev(t1, /*pickCount*/ ctx[2]);
    			if (dirty & /*matchCount*/ 8) set_data_dev(t3, /*matchCount*/ ctx[3]);
    			if (dirty & /*pickCount, matchCount*/ 12 && t5_value !== (t5_value = (100 * /*pickCount*/ ctx[2] / /*matchCount*/ ctx[3]).toFixed(2) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*bans*/ 2 && t9_value !== (t9_value = /*bans*/ ctx[1].length + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*matchCount*/ 8) set_data_dev(t11, /*matchCount*/ ctx[3]);
    			if (dirty & /*bans, matchCount*/ 10 && t13_value !== (t13_value = (100 * /*bans*/ ctx[1].length / /*matchCount*/ ctx[3]).toFixed(2) + "")) set_data_dev(t13, t13_value);

    			if (/*bans*/ ctx[1].length) {
    				if (if_block) ; else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(div1, t15);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*filter, players, Object, groupedBans*/ 529) {
    				each_value_2 = Object.keys(/*groupedBans*/ ctx[9]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*bans, pickCount*/ 6 && t18_value !== (t18_value = /*bans*/ ctx[1].length + /*pickCount*/ ctx[2] + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*matchCount*/ 8) set_data_dev(t20, /*matchCount*/ ctx[3]);
    			if (dirty & /*bans, pickCount, matchCount*/ 14 && t22_value !== (t22_value = (100 * (/*bans*/ ctx[1].length + /*pickCount*/ ctx[2]) / /*matchCount*/ ctx[3]).toFixed(2) + "")) set_data_dev(t22, t22_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(59:4) {#if bans}",
    		ctx
    	});

    	return block;
    }

    // (66:13) {#if bans.length}
    function create_if_block_6(ctx) {
    	let t_value = " by:" + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(66:13) {#if bans.length}",
    		ctx
    	});

    	return block;
    }

    // (68:10) {#if i}
    function create_if_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(",");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(68:10) {#if i}",
    		ctx
    	});

    	return block;
    }

    // (67:8) {#each Object.keys(groupedBans) as playerId, i}
    function create_each_block_2(ctx) {
    	let t0;
    	let span;

    	let t1_value = /*players*/ ctx[0][/*playerId*/ ctx[19]].name + (/*groupedBans*/ ctx[9][/*playerId*/ ctx[19]] > 1
    	? ` (${/*groupedBans*/ ctx[9][/*playerId*/ ctx[19]]}x)`
    	: "") + "";

    	let t1;
    	let span_class_value;
    	let if_block = /*i*/ ctx[16] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(/*filter*/ ctx[4] && /*players*/ ctx[0][/*playerId*/ ctx[19]].name.toLowerCase().includes(/*filter*/ ctx[4].toLowerCase()) && "ban-highlighted") + " svelte-1plw7g3"));
    			add_location(span, file$6, 68, 10, 1987);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players, groupedBans*/ 513 && t1_value !== (t1_value = /*players*/ ctx[0][/*playerId*/ ctx[19]].name + (/*groupedBans*/ ctx[9][/*playerId*/ ctx[19]] > 1
    			? ` (${/*groupedBans*/ ctx[9][/*playerId*/ ctx[19]]}x)`
    			: "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*filter, players, groupedBans*/ 529 && span_class_value !== (span_class_value = "" + (null_to_empty(/*filter*/ ctx[4] && /*players*/ ctx[0][/*playerId*/ ctx[19]].name.toLowerCase().includes(/*filter*/ ctx[4].toLowerCase()) && "ban-highlighted") + " svelte-1plw7g3"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(67:8) {#each Object.keys(groupedBans) as playerId, i}",
    		ctx
    	});

    	return block;
    }

    // (82:2) {#if displayScores}
    function create_if_block$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*groupScores*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "scores svelte-1plw7g3");
    			add_location(div, file$6, 82, 4, 2683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(82:2) {#if displayScores}",
    		ctx
    	});

    	return block;
    }

    // (90:6) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*scores*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players, scores, filter*/ 49) {
    				each_value_1 = /*scores*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(90:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:6) {#if groupScores}
    function create_if_block_1$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*rankedPlayers*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rankedPlayers, filter*/ 1040) {
    				each_value = /*rankedPlayers*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(84:6) {#if groupScores}",
    		ctx
    	});

    	return block;
    }

    // (92:10) {#if players[score.userId]              && (!filter || players[score.userId].name.toLowerCase().includes(filter.toLowerCase()))            }
    function create_if_block_3(ctx) {
    	let current;

    	const scorerow_spread_levels = [
    		{ index: /*i*/ ctx[16] + 1 },
    		{
    			player: /*players*/ ctx[0][/*score*/ ctx[17].userId]
    		},
    		/*score*/ ctx[17]
    	];

    	let scorerow_props = {};

    	for (let i = 0; i < scorerow_spread_levels.length; i += 1) {
    		scorerow_props = assign(scorerow_props, scorerow_spread_levels[i]);
    	}

    	const scorerow = new ScoreRow({ props: scorerow_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(scorerow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scorerow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scorerow_changes = (dirty & /*players, scores*/ 33)
    			? get_spread_update(scorerow_spread_levels, [
    					scorerow_spread_levels[0],
    					{
    						player: /*players*/ ctx[0][/*score*/ ctx[17].userId]
    					},
    					dirty & /*scores*/ 32 && get_spread_object(/*score*/ ctx[17])
    				])
    			: {};

    			scorerow.$set(scorerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scorerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scorerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scorerow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(92:10) {#if players[score.userId]              && (!filter || players[score.userId].name.toLowerCase().includes(filter.toLowerCase()))            }",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#each scores as score, i}
    function create_each_block_1(ctx) {
    	let show_if = /*players*/ ctx[0][/*score*/ ctx[17].userId] && (!/*filter*/ ctx[4] || /*players*/ ctx[0][/*score*/ ctx[17].userId].name.toLowerCase().includes(/*filter*/ ctx[4].toLowerCase()));
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players, scores, filter*/ 49) show_if = /*players*/ ctx[0][/*score*/ ctx[17].userId] && (!/*filter*/ ctx[4] || /*players*/ ctx[0][/*score*/ ctx[17].userId].name.toLowerCase().includes(/*filter*/ ctx[4].toLowerCase()));

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*players, scores, filter*/ 49) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(91:8) {#each scores as score, i}",
    		ctx
    	});

    	return block;
    }

    // (86:10) {#if !filter || player.name.toLowerCase().includes(filter.toLowerCase())}
    function create_if_block_2(ctx) {
    	let current;

    	const scorerow_spread_levels = [
    		{ index: /*i*/ ctx[16] + 1 },
    		{ player: /*player*/ ctx[14] },
    		/*scores*/ ctx[5][0]
    	];

    	let scorerow_props = {};

    	for (let i = 0; i < scorerow_spread_levels.length; i += 1) {
    		scorerow_props = assign(scorerow_props, scorerow_spread_levels[i]);
    	}

    	const scorerow = new ScoreRow({ props: scorerow_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(scorerow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scorerow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scorerow_changes = (dirty & /*rankedPlayers*/ 1024)
    			? get_spread_update(scorerow_spread_levels, [
    					scorerow_spread_levels[0],
    					{ player: /*player*/ ctx[14] },
    					get_spread_object(/*scores*/ ctx[5][0])
    				])
    			: {};

    			scorerow.$set(scorerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scorerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scorerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scorerow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(86:10) {#if !filter || player.name.toLowerCase().includes(filter.toLowerCase())}",
    		ctx
    	});

    	return block;
    }

    // (85:8) {#each rankedPlayers as { player, scores }
    function create_each_block$2(ctx) {
    	let show_if = !/*filter*/ ctx[4] || /*player*/ ctx[14].name.toLowerCase().includes(/*filter*/ ctx[4].toLowerCase());
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filter*/ 16) show_if = !/*filter*/ ctx[4] || /*player*/ ctx[14].name.toLowerCase().includes(/*filter*/ ctx[4].toLowerCase());

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*filter*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(85:8) {#each rankedPlayers as { player, scores }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let b;

    	let t1_value = (/*average*/ ctx[8]
    	? /*average*/ ctx[8].toFixed(0)
    	: "N/A") + "";

    	let t1;
    	let t2;
    	let t3;
    	let button0;
    	let t4_value = (/*displayScores*/ ctx[7] ? "Hide" : "Show") + "";
    	let t4;
    	let t5;
    	let t6;
    	let button1;

    	let t7_value = (/*groupScores*/ ctx[6]
    	? "Show all player scores"
    	: "Only best scores") + "";

    	let t7;
    	let t8;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*bans*/ ctx[1] && create_if_block_4(ctx);
    	let if_block1 = /*displayScores*/ ctx[7] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Average score: ");
    			b = element("b");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			button0 = element("button");
    			t4 = text(t4_value);
    			t5 = text(" scores");
    			t6 = space();
    			button1 = element("button");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block1) if_block1.c();
    			add_location(b, file$6, 56, 21, 1499);
    			attr_dev(div0, "class", "average");
    			add_location(div0, file$6, 55, 4, 1455);
    			attr_dev(div1, "class", "stats svelte-1plw7g3");
    			add_location(div1, file$6, 54, 2, 1430);
    			add_location(button0, file$6, 79, 2, 2468);
    			add_location(button1, file$6, 80, 2, 2553);
    			attr_dev(div2, "class", "root");
    			add_location(div2, file$6, 53, 0, 1408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, b);
    			append_dev(b, t1);
    			append_dev(div1, t2);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div2, t3);
    			append_dev(div2, button0);
    			append_dev(button0, t4);
    			append_dev(button0, t5);
    			append_dev(div2, t6);
    			append_dev(div2, button1);
    			append_dev(button1, t7);
    			append_dev(div2, t8);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleToggle*/ ctx[12], false, false, false),
    					listen_dev(button1, "click", /*handleGroup*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*average*/ 256) && t1_value !== (t1_value = (/*average*/ ctx[8]
    			? /*average*/ ctx[8].toFixed(0)
    			: "N/A") + "")) set_data_dev(t1, t1_value);

    			if (/*bans*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*displayScores*/ 128) && t4_value !== (t4_value = (/*displayScores*/ ctx[7] ? "Hide" : "Show") + "")) set_data_dev(t4, t4_value);

    			if ((!current || dirty & /*groupScores*/ 64) && t7_value !== (t7_value = (/*groupScores*/ ctx[6]
    			? "Show all player scores"
    			: "Only best scores") + "")) set_data_dev(t7, t7_value);

    			if (/*displayScores*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*displayScores*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { players } = $$props;
    	let { scores } = $$props;
    	let { bans } = $$props;
    	let { pickCount } = $$props;
    	let { matchCount } = $$props;
    	let { filter } = $$props;
    	let groupScores = true;
    	let displayScores = true;
    	const playerScores = {};
    	const rankedPlayers = [];
    	let average = 0;

    	scores.forEach(score => {
    		// Ignore scores from non-tournament players
    		if (!players[score.userId]) return;

    		// The scores are already sorted beforehand,
    		// so the pushed player scores should also end up sorted
    		if (!playerScores[score.userId]) {
    			playerScores[score.userId] = [];

    			rankedPlayers.push({
    				player: players[score.userId],
    				// This is the reference to the array,
    				// so we can just keep using the map to look for players below.
    				scores: playerScores[score.userId]
    			});
    		}

    		$$invalidate(8, average += score.score);
    		playerScores[score.userId].push(score);
    	});

    	average /= scores.length;

    	// Group bans
    	const groupedBans = {};

    	if (bans) {
    		bans.forEach(playerId => {
    			if (!players[playerId]) return;
    			if (!groupedBans[playerId]) $$invalidate(9, groupedBans[playerId] = 0, groupedBans);
    			$$invalidate(9, ++groupedBans[playerId], groupedBans);
    		});
    	}

    	function handleGroup() {
    		$$invalidate(6, groupScores = !groupScores);
    	}

    	function handleToggle() {
    		$$invalidate(7, displayScores = !displayScores);
    	}

    	const writable_props = ["players", "scores", "bans", "pickCount", "matchCount", "filter"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScoreList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScoreList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    		if ("scores" in $$props) $$invalidate(5, scores = $$props.scores);
    		if ("bans" in $$props) $$invalidate(1, bans = $$props.bans);
    		if ("pickCount" in $$props) $$invalidate(2, pickCount = $$props.pickCount);
    		if ("matchCount" in $$props) $$invalidate(3, matchCount = $$props.matchCount);
    		if ("filter" in $$props) $$invalidate(4, filter = $$props.filter);
    	};

    	$$self.$capture_state = () => ({
    		ScoreRow,
    		players,
    		scores,
    		bans,
    		pickCount,
    		matchCount,
    		filter,
    		groupScores,
    		displayScores,
    		playerScores,
    		rankedPlayers,
    		average,
    		groupedBans,
    		handleGroup,
    		handleToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    		if ("scores" in $$props) $$invalidate(5, scores = $$props.scores);
    		if ("bans" in $$props) $$invalidate(1, bans = $$props.bans);
    		if ("pickCount" in $$props) $$invalidate(2, pickCount = $$props.pickCount);
    		if ("matchCount" in $$props) $$invalidate(3, matchCount = $$props.matchCount);
    		if ("filter" in $$props) $$invalidate(4, filter = $$props.filter);
    		if ("groupScores" in $$props) $$invalidate(6, groupScores = $$props.groupScores);
    		if ("displayScores" in $$props) $$invalidate(7, displayScores = $$props.displayScores);
    		if ("average" in $$props) $$invalidate(8, average = $$props.average);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		players,
    		bans,
    		pickCount,
    		matchCount,
    		filter,
    		scores,
    		groupScores,
    		displayScores,
    		average,
    		groupedBans,
    		rankedPlayers,
    		handleGroup,
    		handleToggle
    	];
    }

    class ScoreList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			players: 0,
    			scores: 5,
    			bans: 1,
    			pickCount: 2,
    			matchCount: 3,
    			filter: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreList",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[0] === undefined && !("players" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'players'");
    		}

    		if (/*scores*/ ctx[5] === undefined && !("scores" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'scores'");
    		}

    		if (/*bans*/ ctx[1] === undefined && !("bans" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'bans'");
    		}

    		if (/*pickCount*/ ctx[2] === undefined && !("pickCount" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'pickCount'");
    		}

    		if (/*matchCount*/ ctx[3] === undefined && !("matchCount" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'matchCount'");
    		}

    		if (/*filter*/ ctx[4] === undefined && !("filter" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'filter'");
    		}
    	}

    	get players() {
    		throw new Error("<ScoreList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<ScoreList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scores() {
    		throw new Error("<ScoreList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scores(value) {
    		throw new Error("<ScoreList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bans() {
    		throw new Error("<ScoreList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bans(value) {
    		throw new Error("<ScoreList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pickCount() {
    		throw new Error("<ScoreList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pickCount(value) {
    		throw new Error("<ScoreList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get matchCount() {
    		throw new Error("<ScoreList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matchCount(value) {
    		throw new Error("<ScoreList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filter() {
    		throw new Error("<ScoreList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<ScoreList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\MapCard.svelte generated by Svelte v3.23.1 */

    const file$7 = "frontend\\components\\molecules\\MapCard.svelte";

    function create_fragment$7(ctx) {
    	let div7;
    	let div4;
    	let a;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let a_href_value;
    	let t3;
    	let div2;
    	let b0;
    	let t4;
    	let t5;
    	let t6;
    	let br0;
    	let t7;
    	let b1;
    	let t8;
    	let t9;
    	let div3;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let div5;
    	let t15;
    	let t16;
    	let div6;
    	let t17_value = /*counts*/ ctx[9].notes.total + "";
    	let t17;
    	let t18;
    	let br1;
    	let t19;
    	let t20_value = /*counts*/ ctx[9].notes.rice + "";
    	let t20;
    	let t21;
    	let t22_value = /*counts*/ ctx[9].notes.ln + "";
    	let t22;
    	let t23;
    	let br2;
    	let t24;
    	let t25_value = /*counts*/ ctx[9].bpm + "";
    	let t25;
    	let t26;
    	let br3;
    	let t27;
    	let t28_value = /*counts*/ ctx[9].sv + "";
    	let t28;
    	let t29;
    	let br4;
    	let t30;
    	let t31_value = /*counts*/ ctx[9].notes.single + "";
    	let t31;
    	let t32;
    	let br5;
    	let t33;
    	let t34_value = /*counts*/ ctx[9].notes.jump + "";
    	let t34;
    	let t35;
    	let br6;
    	let t36;
    	let t37_value = /*counts*/ ctx[9].notes.hand + "";
    	let t37;
    	let t38;
    	let br7;
    	let t39;
    	let t40_value = /*counts*/ ctx[9].notes.quad + "";
    	let t40;
    	let t41;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div4 = element("div");
    			a = element("a");
    			div0 = element("div");
    			t0 = text(/*artist*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*title*/ ctx[0]);
    			t3 = space();
    			div2 = element("div");
    			b0 = element("b");
    			t4 = text("[");
    			t5 = text(/*difficulty*/ ctx[3]);
    			t6 = text("]");
    			br0 = element("br");
    			t7 = text("beatmap set by ");
    			b1 = element("b");
    			t8 = text(/*mapper*/ ctx[2]);
    			t9 = space();
    			div3 = element("div");
    			t10 = text("HP ");
    			t11 = text(/*hp*/ ctx[6]);
    			t12 = text(", OD ");
    			t13 = text(/*od*/ ctx[7]);
    			t14 = space();
    			div5 = element("div");
    			t15 = text(/*category*/ ctx[8]);
    			t16 = space();
    			div6 = element("div");
    			t17 = text(t17_value);
    			t18 = text(" notes");
    			br1 = element("br");
    			t19 = text("(");
    			t20 = text(t20_value);
    			t21 = text(" rice, ");
    			t22 = text(t22_value);
    			t23 = text(" LNs)");
    			br2 = element("br");
    			t24 = space();
    			t25 = text(t25_value);
    			t26 = text(" BPM events");
    			br3 = element("br");
    			t27 = space();
    			t28 = text(t28_value);
    			t29 = text(" SV events");
    			br4 = element("br");
    			t30 = space();
    			t31 = text(t31_value);
    			t32 = text(" singles");
    			br5 = element("br");
    			t33 = space();
    			t34 = text(t34_value);
    			t35 = text(" jumps");
    			br6 = element("br");
    			t36 = space();
    			t37 = text(t37_value);
    			t38 = text(" hands");
    			br7 = element("br");
    			t39 = space();
    			t40 = text(t40_value);
    			t41 = text(" quads");
    			attr_dev(div0, "class", "artist");
    			add_location(div0, file$7, 16, 6, 398);
    			attr_dev(div1, "class", "name svelte-wc7mb7");
    			attr_dev(div1, "title", /*title*/ ctx[0]);
    			add_location(div1, file$7, 17, 6, 440);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/beatmapsets/${/*beatmapSetId*/ ctx[5]}#mania/${/*beatmapId*/ ctx[4]}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$7, 15, 4, 296);
    			add_location(b0, file$7, 20, 6, 529);
    			add_location(br0, file$7, 20, 27, 550);
    			add_location(b1, file$7, 20, 48, 571);
    			attr_dev(div2, "class", "mapper");
    			add_location(div2, file$7, 19, 4, 501);
    			attr_dev(div3, "class", "metrics svelte-wc7mb7");
    			add_location(div3, file$7, 22, 4, 604);
    			attr_dev(div4, "class", "title svelte-wc7mb7");
    			add_location(div4, file$7, 14, 2, 271);
    			attr_dev(div5, "class", "category svelte-wc7mb7");
    			add_location(div5, file$7, 26, 2, 675);
    			add_location(br1, file$7, 28, 30, 769);
    			add_location(br2, file$7, 28, 85, 824);
    			add_location(br3, file$7, 29, 27, 859);
    			add_location(br4, file$7, 30, 25, 892);
    			add_location(br5, file$7, 31, 33, 933);
    			add_location(br6, file$7, 32, 29, 970);
    			add_location(br7, file$7, 33, 29, 1007);
    			attr_dev(div6, "class", "counts svelte-wc7mb7");
    			add_location(div6, file$7, 27, 2, 717);
    			attr_dev(div7, "class", "root svelte-wc7mb7");
    			add_location(div7, file$7, 13, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div4);
    			append_dev(div4, a);
    			append_dev(a, div0);
    			append_dev(div0, t0);
    			append_dev(a, t1);
    			append_dev(a, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, b0);
    			append_dev(b0, t4);
    			append_dev(b0, t5);
    			append_dev(b0, t6);
    			append_dev(div2, br0);
    			append_dev(div2, t7);
    			append_dev(div2, b1);
    			append_dev(b1, t8);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, t10);
    			append_dev(div3, t11);
    			append_dev(div3, t12);
    			append_dev(div3, t13);
    			append_dev(div7, t14);
    			append_dev(div7, div5);
    			append_dev(div5, t15);
    			append_dev(div7, t16);
    			append_dev(div7, div6);
    			append_dev(div6, t17);
    			append_dev(div6, t18);
    			append_dev(div6, br1);
    			append_dev(div6, t19);
    			append_dev(div6, t20);
    			append_dev(div6, t21);
    			append_dev(div6, t22);
    			append_dev(div6, t23);
    			append_dev(div6, br2);
    			append_dev(div6, t24);
    			append_dev(div6, t25);
    			append_dev(div6, t26);
    			append_dev(div6, br3);
    			append_dev(div6, t27);
    			append_dev(div6, t28);
    			append_dev(div6, t29);
    			append_dev(div6, br4);
    			append_dev(div6, t30);
    			append_dev(div6, t31);
    			append_dev(div6, t32);
    			append_dev(div6, br5);
    			append_dev(div6, t33);
    			append_dev(div6, t34);
    			append_dev(div6, t35);
    			append_dev(div6, br6);
    			append_dev(div6, t36);
    			append_dev(div6, t37);
    			append_dev(div6, t38);
    			append_dev(div6, br7);
    			append_dev(div6, t39);
    			append_dev(div6, t40);
    			append_dev(div6, t41);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*artist*/ 2) set_data_dev(t0, /*artist*/ ctx[1]);
    			if (dirty & /*title*/ 1) set_data_dev(t2, /*title*/ ctx[0]);

    			if (dirty & /*title*/ 1) {
    				attr_dev(div1, "title", /*title*/ ctx[0]);
    			}

    			if (dirty & /*beatmapSetId, beatmapId*/ 48 && a_href_value !== (a_href_value = `https://osu.ppy.sh/beatmapsets/${/*beatmapSetId*/ ctx[5]}#mania/${/*beatmapId*/ ctx[4]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*difficulty*/ 8) set_data_dev(t5, /*difficulty*/ ctx[3]);
    			if (dirty & /*mapper*/ 4) set_data_dev(t8, /*mapper*/ ctx[2]);
    			if (dirty & /*hp*/ 64) set_data_dev(t11, /*hp*/ ctx[6]);
    			if (dirty & /*od*/ 128) set_data_dev(t13, /*od*/ ctx[7]);
    			if (dirty & /*category*/ 256) set_data_dev(t15, /*category*/ ctx[8]);
    			if (dirty & /*counts*/ 512 && t17_value !== (t17_value = /*counts*/ ctx[9].notes.total + "")) set_data_dev(t17, t17_value);
    			if (dirty & /*counts*/ 512 && t20_value !== (t20_value = /*counts*/ ctx[9].notes.rice + "")) set_data_dev(t20, t20_value);
    			if (dirty & /*counts*/ 512 && t22_value !== (t22_value = /*counts*/ ctx[9].notes.ln + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*counts*/ 512 && t25_value !== (t25_value = /*counts*/ ctx[9].bpm + "")) set_data_dev(t25, t25_value);
    			if (dirty & /*counts*/ 512 && t28_value !== (t28_value = /*counts*/ ctx[9].sv + "")) set_data_dev(t28, t28_value);
    			if (dirty & /*counts*/ 512 && t31_value !== (t31_value = /*counts*/ ctx[9].notes.single + "")) set_data_dev(t31, t31_value);
    			if (dirty & /*counts*/ 512 && t34_value !== (t34_value = /*counts*/ ctx[9].notes.jump + "")) set_data_dev(t34, t34_value);
    			if (dirty & /*counts*/ 512 && t37_value !== (t37_value = /*counts*/ ctx[9].notes.hand + "")) set_data_dev(t37, t37_value);
    			if (dirty & /*counts*/ 512 && t40_value !== (t40_value = /*counts*/ ctx[9].notes.quad + "")) set_data_dev(t40, t40_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { artist } = $$props;
    	let { mapper } = $$props;
    	let { difficulty } = $$props;
    	let { beatmapId } = $$props;
    	let { beatmapSetId } = $$props;
    	let { hp } = $$props;
    	let { od } = $$props;
    	let { category } = $$props;
    	let { counts } = $$props;

    	const writable_props = [
    		"title",
    		"artist",
    		"mapper",
    		"difficulty",
    		"beatmapId",
    		"beatmapSetId",
    		"hp",
    		"od",
    		"category",
    		"counts"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MapCard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MapCard", $$slots, []);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("artist" in $$props) $$invalidate(1, artist = $$props.artist);
    		if ("mapper" in $$props) $$invalidate(2, mapper = $$props.mapper);
    		if ("difficulty" in $$props) $$invalidate(3, difficulty = $$props.difficulty);
    		if ("beatmapId" in $$props) $$invalidate(4, beatmapId = $$props.beatmapId);
    		if ("beatmapSetId" in $$props) $$invalidate(5, beatmapSetId = $$props.beatmapSetId);
    		if ("hp" in $$props) $$invalidate(6, hp = $$props.hp);
    		if ("od" in $$props) $$invalidate(7, od = $$props.od);
    		if ("category" in $$props) $$invalidate(8, category = $$props.category);
    		if ("counts" in $$props) $$invalidate(9, counts = $$props.counts);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		artist,
    		mapper,
    		difficulty,
    		beatmapId,
    		beatmapSetId,
    		hp,
    		od,
    		category,
    		counts
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("artist" in $$props) $$invalidate(1, artist = $$props.artist);
    		if ("mapper" in $$props) $$invalidate(2, mapper = $$props.mapper);
    		if ("difficulty" in $$props) $$invalidate(3, difficulty = $$props.difficulty);
    		if ("beatmapId" in $$props) $$invalidate(4, beatmapId = $$props.beatmapId);
    		if ("beatmapSetId" in $$props) $$invalidate(5, beatmapSetId = $$props.beatmapSetId);
    		if ("hp" in $$props) $$invalidate(6, hp = $$props.hp);
    		if ("od" in $$props) $$invalidate(7, od = $$props.od);
    		if ("category" in $$props) $$invalidate(8, category = $$props.category);
    		if ("counts" in $$props) $$invalidate(9, counts = $$props.counts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		artist,
    		mapper,
    		difficulty,
    		beatmapId,
    		beatmapSetId,
    		hp,
    		od,
    		category,
    		counts
    	];
    }

    class MapCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			title: 0,
    			artist: 1,
    			mapper: 2,
    			difficulty: 3,
    			beatmapId: 4,
    			beatmapSetId: 5,
    			hp: 6,
    			od: 7,
    			category: 8,
    			counts: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapCard",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<MapCard> was created without expected prop 'title'");
    		}

    		if (/*artist*/ ctx[1] === undefined && !("artist" in props)) {
    			console.warn("<MapCard> was created without expected prop 'artist'");
    		}

    		if (/*mapper*/ ctx[2] === undefined && !("mapper" in props)) {
    			console.warn("<MapCard> was created without expected prop 'mapper'");
    		}

    		if (/*difficulty*/ ctx[3] === undefined && !("difficulty" in props)) {
    			console.warn("<MapCard> was created without expected prop 'difficulty'");
    		}

    		if (/*beatmapId*/ ctx[4] === undefined && !("beatmapId" in props)) {
    			console.warn("<MapCard> was created without expected prop 'beatmapId'");
    		}

    		if (/*beatmapSetId*/ ctx[5] === undefined && !("beatmapSetId" in props)) {
    			console.warn("<MapCard> was created without expected prop 'beatmapSetId'");
    		}

    		if (/*hp*/ ctx[6] === undefined && !("hp" in props)) {
    			console.warn("<MapCard> was created without expected prop 'hp'");
    		}

    		if (/*od*/ ctx[7] === undefined && !("od" in props)) {
    			console.warn("<MapCard> was created without expected prop 'od'");
    		}

    		if (/*category*/ ctx[8] === undefined && !("category" in props)) {
    			console.warn("<MapCard> was created without expected prop 'category'");
    		}

    		if (/*counts*/ ctx[9] === undefined && !("counts" in props)) {
    			console.warn("<MapCard> was created without expected prop 'counts'");
    		}
    	}

    	get title() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get artist() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set artist(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mapper() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mapper(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get difficulty() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set difficulty(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beatmapId() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beatmapId(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beatmapSetId() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beatmapSetId(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hp() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hp(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get od() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set od(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counts() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counts(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\pages\Stage.svelte generated by Svelte v3.23.1 */
    const file$8 = "frontend\\pages\\Stage.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (81:2) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading tournament data...";
    			add_location(p, file$8, 81, 4, 2323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(81:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#if !loading}
    function create_if_block$3(ctx) {
    	let t0;
    	let h1;
    	let t1_value = /*$stage*/ ctx[4].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let h2;
    	let t5_value = /*$stage*/ ctx[4].maps.length + "";
    	let t5;
    	let t6;
    	let t7;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	const header = new Header({
    			props: {
    				backHref: `#/tournaments/${/*tournamentId*/ ctx[0]}`
    			},
    			$$inline: true
    		});

    	header.$on("search", /*handleSearch*/ ctx[5]);
    	let if_block0 = /*$stage*/ ctx[4].rolls && create_if_block_2$1(ctx);
    	let if_block1 = /*$stage*/ ctx[4].qualifiers && create_if_block_1$3(ctx);
    	let each_value = /*$stage*/ ctx[4].maps;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*map*/ ctx[7].beatmapId;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			h2 = element("h2");
    			t5 = text(t5_value);
    			t6 = text(" maps");
    			t7 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$8, 47, 4, 1469);
    			add_location(h2, file$8, 64, 4, 1850);
    			attr_dev(div, "class", "maps");
    			add_location(div, file$8, 65, 4, 1890);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t5);
    			append_dev(h2, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty & /*tournamentId*/ 1) header_changes.backHref = `#/tournaments/${/*tournamentId*/ ctx[0]}`;
    			header.$set(header_changes);
    			if ((!current || dirty & /*$stage*/ 16) && t1_value !== (t1_value = /*$stage*/ ctx[4].name + "")) set_data_dev(t1, t1_value);

    			if (/*$stage*/ ctx[4].rolls) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$stage*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$stage*/ ctx[4].qualifiers) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$stage*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t4.parentNode, t4);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*$stage*/ 16) && t5_value !== (t5_value = /*$stage*/ ctx[4].maps.length + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$tournament, $stage, filter*/ 28) {
    				const each_value = /*$stage*/ ctx[4].maps;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(46:2) {#if !loading}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if $stage.rolls}
    function create_if_block_2$1(ctx) {
    	let h2;
    	let t1;
    	let current;

    	const rolllist = new RollList({
    			props: {
    				rolls: /*$stage*/ ctx[4].rolls,
    				players: /*$tournament*/ ctx[3].players,
    				filter: /*filter*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Rolls";
    			t1 = space();
    			create_component(rolllist.$$.fragment);
    			add_location(h2, file$8, 49, 6, 1523);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(rolllist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const rolllist_changes = {};
    			if (dirty & /*$stage*/ 16) rolllist_changes.rolls = /*$stage*/ ctx[4].rolls;
    			if (dirty & /*$tournament*/ 8) rolllist_changes.players = /*$tournament*/ ctx[3].players;
    			if (dirty & /*filter*/ 4) rolllist_changes.filter = /*filter*/ ctx[2];
    			rolllist.$set(rolllist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rolllist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rolllist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_component(rolllist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(49:4) {#if $stage.rolls}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if $stage.qualifiers}
    function create_if_block_1$3(ctx) {
    	let h2;
    	let t1;
    	let current;

    	const qualifierslist = new QualifiersList({
    			props: {
    				players: /*$tournament*/ ctx[3].players,
    				maps: /*$stage*/ ctx[4].maps,
    				filter: /*filter*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Seeding";
    			t1 = space();
    			create_component(qualifierslist.$$.fragment);
    			add_location(h2, file$8, 57, 6, 1699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(qualifierslist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const qualifierslist_changes = {};
    			if (dirty & /*$tournament*/ 8) qualifierslist_changes.players = /*$tournament*/ ctx[3].players;
    			if (dirty & /*$stage*/ 16) qualifierslist_changes.maps = /*$stage*/ ctx[4].maps;
    			if (dirty & /*filter*/ 4) qualifierslist_changes.filter = /*filter*/ ctx[2];
    			qualifierslist.$set(qualifierslist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(qualifierslist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(qualifierslist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_component(qualifierslist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(57:4) {#if $stage.qualifiers}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#each $stage.maps as map (map.beatmapId)}
    function create_each_block$3(key_1, ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const mapcard_spread_levels = [/*map*/ ctx[7]];
    	let mapcard_props = {};

    	for (let i = 0; i < mapcard_spread_levels.length; i += 1) {
    		mapcard_props = assign(mapcard_props, mapcard_spread_levels[i]);
    	}

    	const mapcard = new MapCard({ props: mapcard_props, $$inline: true });

    	const scorelist = new ScoreList({
    			props: {
    				players: /*$tournament*/ ctx[3].players,
    				scores: /*map*/ ctx[7].scores,
    				bans: /*map*/ ctx[7].bans,
    				pickCount: /*map*/ ctx[7].pickCount,
    				matchCount: /*$stage*/ ctx[4].matchCount,
    				filter: /*filter*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(mapcard.$$.fragment);
    			t0 = space();
    			create_component(scorelist.$$.fragment);
    			t1 = space();
    			attr_dev(div, "class", "map svelte-ztog05");
    			add_location(div, file$8, 67, 8, 1968);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mapcard, div, null);
    			append_dev(div, t0);
    			mount_component(scorelist, div, null);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mapcard_changes = (dirty & /*$stage*/ 16)
    			? get_spread_update(mapcard_spread_levels, [get_spread_object(/*map*/ ctx[7])])
    			: {};

    			mapcard.$set(mapcard_changes);
    			const scorelist_changes = {};
    			if (dirty & /*$tournament*/ 8) scorelist_changes.players = /*$tournament*/ ctx[3].players;
    			if (dirty & /*$stage*/ 16) scorelist_changes.scores = /*map*/ ctx[7].scores;
    			if (dirty & /*$stage*/ 16) scorelist_changes.bans = /*map*/ ctx[7].bans;
    			if (dirty & /*$stage*/ 16) scorelist_changes.pickCount = /*map*/ ctx[7].pickCount;
    			if (dirty & /*$stage*/ 16) scorelist_changes.matchCount = /*$stage*/ ctx[4].matchCount;
    			if (dirty & /*filter*/ 4) scorelist_changes.filter = /*filter*/ ctx[2];
    			scorelist.$set(scorelist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapcard.$$.fragment, local);
    			transition_in(scorelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapcard.$$.fragment, local);
    			transition_out(scorelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mapcard);
    			destroy_component(scorelist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(67:6) {#each $stage.maps as map (map.beatmapId)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*loading*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-ztog05");
    			add_location(main, file$8, 44, 0, 1355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $tournament;
    	let $stage;
    	validate_store(tournament, "tournament");
    	component_subscribe($$self, tournament, $$value => $$invalidate(3, $tournament = $$value));
    	validate_store(stage, "stage");
    	component_subscribe($$self, stage, $$value => $$invalidate(4, $stage = $$value));
    	let { id } = $$props;
    	let { tournamentId } = $$props;
    	let loading = true;
    	let filter = null;

    	function handleSearch(event) {
    		$$invalidate(2, filter = event.detail);
    	}

    	onMount(async () => {
    		if (!$tournament || $tournament.id != tournamentId) {
    			try {
    				tournament.set(null);
    				stage.set(null);
    				const res1 = await fetch(`data/${tournamentId}.json`);
    				tournament.set(await res1.json());
    				const res2 = await fetch(`data/${tournamentId}.${id}.json`);
    				stage.set(await res2.json());
    			} catch {
    				location.hash = "";
    			}
    		}

    		if (!$stage || $stage.id != id) {
    			try {
    				stage.set(null);
    				const res = await fetch(`data/${tournamentId}.${id}.json`);
    				stage.set(await res.json());
    			} catch {
    				location.hash = `#/tournaments/${tournamentId}`;
    			}
    		}

    		$$invalidate(1, loading = false);
    	});

    	const writable_props = ["id", "tournamentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stage", $$slots, []);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(6, id = $$props.id);
    		if ("tournamentId" in $$props) $$invalidate(0, tournamentId = $$props.tournamentId);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tournament,
    		stage,
    		Header,
    		RollList,
    		QualifiersList,
    		ScoreList,
    		MapCard,
    		id,
    		tournamentId,
    		loading,
    		filter,
    		handleSearch,
    		$tournament,
    		$stage
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(6, id = $$props.id);
    		if ("tournamentId" in $$props) $$invalidate(0, tournamentId = $$props.tournamentId);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("filter" in $$props) $$invalidate(2, filter = $$props.filter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tournamentId, loading, filter, $tournament, $stage, handleSearch, id];
    }

    class Stage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { id: 6, tournamentId: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stage",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[6] === undefined && !("id" in props)) {
    			console.warn("<Stage> was created without expected prop 'id'");
    		}

    		if (/*tournamentId*/ ctx[0] === undefined && !("tournamentId" in props)) {
    			console.warn("<Stage> was created without expected prop 'tournamentId'");
    		}
    	}

    	get id() {
    		throw new Error("<Stage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Stage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tournamentId() {
    		throw new Error("<Stage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tournamentId(value) {
    		throw new Error("<Stage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\PlayerRow.svelte generated by Svelte v3.23.1 */

    const file$9 = "frontend\\components\\molecules\\PlayerRow.svelte";

    function create_fragment$9(ctx) {
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let a;
    	let t1;
    	let a_href_value;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let br;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			a = element("a");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			div2 = element("div");
    			t3 = text("#");
    			t4 = text(/*rank*/ ctx[5]);
    			t5 = text(" (");
    			t6 = text(/*pp*/ ctx[4]);
    			t7 = text(" pp)");
    			br = element("br");
    			t8 = space();
    			t9 = text(/*country*/ ctx[3]);
    			t10 = text(" (#");
    			t11 = text(/*countryRank*/ ctx[6]);
    			t12 = text(")");
    			if (img.src !== (img_src_value = /*avatar*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ot3nx9");
    			add_location(img, file$9, 12, 4, 219);
    			attr_dev(div0, "class", "avatar svelte-ot3nx9");
    			add_location(div0, file$9, 11, 2, 193);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/users/${/*id*/ ctx[0]}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 15, 4, 284);
    			attr_dev(div1, "class", "name svelte-ot3nx9");
    			add_location(div1, file$9, 14, 2, 260);
    			add_location(br, file$9, 20, 21, 422);
    			attr_dev(div2, "class", "info svelte-ot3nx9");
    			add_location(div2, file$9, 19, 2, 381);
    			attr_dev(div3, "class", "root svelte-ot3nx9");
    			add_location(div3, file$9, 10, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, a);
    			append_dev(a, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    			append_dev(div2, t7);
    			append_dev(div2, br);
    			append_dev(div2, t8);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div2, t11);
    			append_dev(div2, t12);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*avatar*/ 4 && img.src !== (img_src_value = /*avatar*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);

    			if (dirty & /*id*/ 1 && a_href_value !== (a_href_value = `https://osu.ppy.sh/users/${/*id*/ ctx[0]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*rank*/ 32) set_data_dev(t4, /*rank*/ ctx[5]);
    			if (dirty & /*pp*/ 16) set_data_dev(t6, /*pp*/ ctx[4]);
    			if (dirty & /*country*/ 8) set_data_dev(t9, /*country*/ ctx[3]);
    			if (dirty & /*countryRank*/ 64) set_data_dev(t11, /*countryRank*/ ctx[6]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { name } = $$props;
    	let { avatar } = $$props;
    	let { country } = $$props;
    	let { pp } = $$props;
    	let { rank } = $$props;
    	let { countryRank } = $$props;
    	const writable_props = ["id", "name", "avatar", "country", "pp", "rank", "countryRank"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PlayerRow", $$slots, []);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("avatar" in $$props) $$invalidate(2, avatar = $$props.avatar);
    		if ("country" in $$props) $$invalidate(3, country = $$props.country);
    		if ("pp" in $$props) $$invalidate(4, pp = $$props.pp);
    		if ("rank" in $$props) $$invalidate(5, rank = $$props.rank);
    		if ("countryRank" in $$props) $$invalidate(6, countryRank = $$props.countryRank);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		name,
    		avatar,
    		country,
    		pp,
    		rank,
    		countryRank
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("avatar" in $$props) $$invalidate(2, avatar = $$props.avatar);
    		if ("country" in $$props) $$invalidate(3, country = $$props.country);
    		if ("pp" in $$props) $$invalidate(4, pp = $$props.pp);
    		if ("rank" in $$props) $$invalidate(5, rank = $$props.rank);
    		if ("countryRank" in $$props) $$invalidate(6, countryRank = $$props.countryRank);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, name, avatar, country, pp, rank, countryRank];
    }

    class PlayerRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			id: 0,
    			name: 1,
    			avatar: 2,
    			country: 3,
    			pp: 4,
    			rank: 5,
    			countryRank: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerRow",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'name'");
    		}

    		if (/*avatar*/ ctx[2] === undefined && !("avatar" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'avatar'");
    		}

    		if (/*country*/ ctx[3] === undefined && !("country" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'country'");
    		}

    		if (/*pp*/ ctx[4] === undefined && !("pp" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'pp'");
    		}

    		if (/*rank*/ ctx[5] === undefined && !("rank" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'rank'");
    		}

    		if (/*countryRank*/ ctx[6] === undefined && !("countryRank" in props)) {
    			console.warn("<PlayerRow> was created without expected prop 'countryRank'");
    		}
    	}

    	get id() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatar() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatar(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get country() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set country(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pp() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pp(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rank() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rank(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get countryRank() {
    		throw new Error("<PlayerRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set countryRank(value) {
    		throw new Error("<PlayerRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\organisms\PlayerList.svelte generated by Svelte v3.23.1 */
    const file$a = "frontend\\components\\organisms\\PlayerList.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (32:4) {#each sortedPlayers as player}
    function create_each_block$4(ctx) {
    	let current;
    	const playerrow_spread_levels = [/*player*/ ctx[7]];
    	let playerrow_props = {};

    	for (let i = 0; i < playerrow_spread_levels.length; i += 1) {
    		playerrow_props = assign(playerrow_props, playerrow_spread_levels[i]);
    	}

    	const playerrow = new PlayerRow({ props: playerrow_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(playerrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(playerrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const playerrow_changes = (dirty & /*sortedPlayers*/ 1)
    			? get_spread_update(playerrow_spread_levels, [get_spread_object(/*player*/ ctx[7])])
    			: {};

    			playerrow.$set(playerrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playerrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playerrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playerrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(32:4) {#each sortedPlayers as player}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*sortedPlayers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Alphabetical";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Rank";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(button0, file$a, 28, 2, 719);
    			add_location(button1, file$a, 29, 2, 786);
    			attr_dev(div0, "class", "players svelte-xa7zg9");
    			add_location(div0, file$a, 30, 2, 837);
    			attr_dev(div1, "class", "root");
    			add_location(div1, file$a, 27, 0, 697);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t1);
    			append_dev(div1, button1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleAlphabeticalSort*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*handleRankSort*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sortedPlayers*/ 1) {
    				each_value = /*sortedPlayers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { players } = $$props;
    	let { sort = "rank" } = $$props;
    	let sortedPlayers;
    	const sortByAlphabetical = players => players.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
    	const sortByRank = players => players.sort((a, b) => a.rank < b.rank ? -1 : 1);

    	function handleAlphabeticalSort() {
    		$$invalidate(0, sortedPlayers = sortByAlphabetical(players));
    	}

    	function handleRankSort() {
    		$$invalidate(0, sortedPlayers = sortByRank(players));
    	}

    	const writable_props = ["players", "sort"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PlayerList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("players" in $$props) $$invalidate(3, players = $$props.players);
    		if ("sort" in $$props) $$invalidate(4, sort = $$props.sort);
    	};

    	$$self.$capture_state = () => ({
    		PlayerRow,
    		players,
    		sort,
    		sortedPlayers,
    		sortByAlphabetical,
    		sortByRank,
    		handleAlphabeticalSort,
    		handleRankSort
    	});

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(3, players = $$props.players);
    		if ("sort" in $$props) $$invalidate(4, sort = $$props.sort);
    		if ("sortedPlayers" in $$props) $$invalidate(0, sortedPlayers = $$props.sortedPlayers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sort, players*/ 24) {
    			 {
    				if (sort === "rank") {
    					$$invalidate(0, sortedPlayers = sortByRank(players));
    				} else {
    					$$invalidate(0, sortedPlayers = sortByAlphabetical(players));
    				}
    			}
    		}
    	};

    	return [sortedPlayers, handleAlphabeticalSort, handleRankSort, players, sort];
    }

    class PlayerList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { players: 3, sort: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerList",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[3] === undefined && !("players" in props)) {
    			console.warn("<PlayerList> was created without expected prop 'players'");
    		}
    	}

    	get players() {
    		throw new Error("<PlayerList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<PlayerList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sort() {
    		throw new Error("<PlayerList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sort(value) {
    		throw new Error("<PlayerList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\StageRow.svelte generated by Svelte v3.23.1 */

    const file$b = "frontend\\components\\molecules\\StageRow.svelte";

    function create_fragment$b(ctx) {
    	let div2;
    	let div0;
    	let a;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*mapCount*/ ctx[1]);
    			t3 = text(" maps");
    			attr_dev(a, "href", /*href*/ ctx[2]);
    			add_location(a, file$b, 8, 4, 133);
    			attr_dev(div0, "class", "name svelte-b5fgg6");
    			add_location(div0, file$b, 7, 2, 109);
    			attr_dev(div1, "class", "maps svelte-b5fgg6");
    			add_location(div1, file$b, 12, 2, 186);
    			attr_dev(div2, "class", "root svelte-b5fgg6");
    			add_location(div2, file$b, 6, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*href*/ 4) {
    				attr_dev(a, "href", /*href*/ ctx[2]);
    			}

    			if (dirty & /*mapCount*/ 2) set_data_dev(t2, /*mapCount*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { mapCount } = $$props;
    	let { href } = $$props;
    	const writable_props = ["name", "mapCount", "href"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StageRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("StageRow", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("mapCount" in $$props) $$invalidate(1, mapCount = $$props.mapCount);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    	};

    	$$self.$capture_state = () => ({ name, mapCount, href });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("mapCount" in $$props) $$invalidate(1, mapCount = $$props.mapCount);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, mapCount, href];
    }

    class StageRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { name: 0, mapCount: 1, href: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StageRow",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<StageRow> was created without expected prop 'name'");
    		}

    		if (/*mapCount*/ ctx[1] === undefined && !("mapCount" in props)) {
    			console.warn("<StageRow> was created without expected prop 'mapCount'");
    		}

    		if (/*href*/ ctx[2] === undefined && !("href" in props)) {
    			console.warn("<StageRow> was created without expected prop 'href'");
    		}
    	}

    	get name() {
    		throw new Error("<StageRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<StageRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mapCount() {
    		throw new Error("<StageRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mapCount(value) {
    		throw new Error("<StageRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<StageRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<StageRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\pages\Tournament.svelte generated by Svelte v3.23.1 */

    const { Object: Object_1$3 } = globals;
    const file$c = "frontend\\pages\\Tournament.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (53:2) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading tournament data...";
    			add_location(p, file$c, 53, 4, 1563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(53:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:2) {#if !loading}
    function create_if_block$4(ctx) {
    	let t0;
    	let h1;
    	let t1_value = /*$tournament*/ ctx[3].name + "";
    	let t1;
    	let t2;
    	let h20;
    	let t3_value = /*$tournament*/ ctx[3].stages.length + "";
    	let t3;
    	let t4;
    	let t5;
    	let div0;
    	let t6;
    	let h21;
    	let t7_value = Object.keys(/*$tournament*/ ctx[3].players).length + "";
    	let t7;
    	let t8;
    	let t9;
    	let div1;
    	let current;

    	const header = new Header({
    			props: { backHref: "#/" },
    			$$inline: true
    		});

    	header.$on("search", /*handleSearch*/ ctx[4]);
    	let each_value = /*$tournament*/ ctx[3].stages;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const playerlist = new PlayerList({
    			props: { players: /*displayPlayers*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			h20 = element("h2");
    			t3 = text(t3_value);
    			t4 = text(" stages");
    			t5 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			h21 = element("h2");
    			t7 = text(t7_value);
    			t8 = text(" players");
    			t9 = space();
    			div1 = element("div");
    			create_component(playerlist.$$.fragment);
    			add_location(h1, file$c, 41, 4, 1143);
    			add_location(h20, file$c, 42, 4, 1176);
    			attr_dev(div0, "class", "stages svelte-wv5a2v");
    			add_location(div0, file$c, 43, 4, 1225);
    			add_location(h21, file$c, 48, 4, 1402);
    			attr_dev(div1, "class", "players");
    			add_location(div1, file$c, 49, 4, 1466);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t3);
    			append_dev(h20, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t7);
    			append_dev(h21, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(playerlist, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$tournament*/ 8) && t1_value !== (t1_value = /*$tournament*/ ctx[3].name + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*$tournament*/ 8) && t3_value !== (t3_value = /*$tournament*/ ctx[3].stages.length + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*$tournament, id*/ 9) {
    				each_value = /*$tournament*/ ctx[3].stages;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*$tournament*/ 8) && t7_value !== (t7_value = Object.keys(/*$tournament*/ ctx[3].players).length + "")) set_data_dev(t7, t7_value);
    			const playerlist_changes = {};
    			if (dirty & /*displayPlayers*/ 2) playerlist_changes.players = /*displayPlayers*/ ctx[1];
    			playerlist.$set(playerlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(playerlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(playerlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div1);
    			destroy_component(playerlist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(40:2) {#if !loading}",
    		ctx
    	});

    	return block;
    }

    // (45:6) {#each $tournament.stages as stage}
    function create_each_block$5(ctx) {
    	let current;

    	const stagerow_spread_levels = [
    		/*stage*/ ctx[6],
    		{
    			href: `#/tournaments/${/*id*/ ctx[0]}/stages/${/*stage*/ ctx[6].id}`
    		}
    	];

    	let stagerow_props = {};

    	for (let i = 0; i < stagerow_spread_levels.length; i += 1) {
    		stagerow_props = assign(stagerow_props, stagerow_spread_levels[i]);
    	}

    	const stagerow = new StageRow({ props: stagerow_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(stagerow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stagerow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stagerow_changes = (dirty & /*$tournament, id*/ 9)
    			? get_spread_update(stagerow_spread_levels, [
    					dirty & /*$tournament*/ 8 && get_spread_object(/*stage*/ ctx[6]),
    					{
    						href: `#/tournaments/${/*id*/ ctx[0]}/stages/${/*stage*/ ctx[6].id}`
    					}
    				])
    			: {};

    			stagerow.$set(stagerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stagerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stagerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stagerow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(45:6) {#each $tournament.stages as stage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*loading*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-wv5a2v");
    			add_location(main, file$c, 38, 0, 1058);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $tournament;
    	validate_store(tournament, "tournament");
    	component_subscribe($$self, tournament, $$value => $$invalidate(3, $tournament = $$value));
    	let { id } = $$props;
    	let playerValues;
    	let displayPlayers;
    	let loading = true;

    	function handleSearch(event) {
    		const text = event.detail;

    		if (!text) $$invalidate(1, displayPlayers = playerValues); else {
    			$$invalidate(1, displayPlayers = playerValues.filter(player => player.name.toLowerCase().includes(text.toLowerCase())));
    		}
    	}

    	onMount(async () => {
    		if (!$tournament || $tournament.id != id) {
    			try {
    				tournament.set(null);
    				const res = await fetch(`data/${id}.json`);
    				tournament.set(await res.json());
    			} catch {
    				location.hash = "";
    			}
    		}

    		playerValues = Object.values($tournament.players);
    		$$invalidate(1, displayPlayers = playerValues);
    		$$invalidate(2, loading = false);
    	});

    	const writable_props = ["id"];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tournament> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tournament", $$slots, []);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tournament,
    		Header,
    		PlayerList,
    		StageRow,
    		id,
    		playerValues,
    		displayPlayers,
    		loading,
    		handleSearch,
    		$tournament
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("playerValues" in $$props) playerValues = $$props.playerValues;
    		if ("displayPlayers" in $$props) $$invalidate(1, displayPlayers = $$props.displayPlayers);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, displayPlayers, loading, $tournament, handleSearch];
    }

    class Tournament extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tournament",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Tournament> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Tournament>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Tournament>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\components\molecules\TournamentRow.svelte generated by Svelte v3.23.1 */

    const file$d = "frontend\\components\\molecules\\TournamentRow.svelte";

    function create_fragment$d(ctx) {
    	let div2;
    	let div0;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let div1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*playersCount*/ ctx[2]);
    			t3 = text(" players");
    			attr_dev(a, "href", a_href_value = `#/tournaments/${/*id*/ ctx[1]}`);
    			add_location(a, file$d, 8, 4, 135);
    			attr_dev(div0, "class", "name svelte-1lh8f59");
    			add_location(div0, file$d, 7, 2, 111);
    			attr_dev(div1, "class", "players svelte-1lh8f59");
    			add_location(div1, file$d, 12, 2, 205);
    			attr_dev(div2, "class", "root svelte-1lh8f59");
    			add_location(div2, file$d, 6, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*id*/ 2 && a_href_value !== (a_href_value = `#/tournaments/${/*id*/ ctx[1]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*playersCount*/ 4) set_data_dev(t2, /*playersCount*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { id } = $$props;
    	let { playersCount } = $$props;
    	const writable_props = ["name", "id", "playersCount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TournamentRow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TournamentRow", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("playersCount" in $$props) $$invalidate(2, playersCount = $$props.playersCount);
    	};

    	$$self.$capture_state = () => ({ name, id, playersCount });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("playersCount" in $$props) $$invalidate(2, playersCount = $$props.playersCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, id, playersCount];
    }

    class TournamentRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { name: 0, id: 1, playersCount: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TournamentRow",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<TournamentRow> was created without expected prop 'name'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<TournamentRow> was created without expected prop 'id'");
    		}

    		if (/*playersCount*/ ctx[2] === undefined && !("playersCount" in props)) {
    			console.warn("<TournamentRow> was created without expected prop 'playersCount'");
    		}
    	}

    	get name() {
    		throw new Error("<TournamentRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TournamentRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TournamentRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TournamentRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get playersCount() {
    		throw new Error("<TournamentRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set playersCount(value) {
    		throw new Error("<TournamentRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* frontend\pages\Tournaments.svelte generated by Svelte v3.23.1 */
    const file$e = "frontend\\pages\\Tournaments.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (20:4) {:else}
    function create_else_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading tournaments...";
    			add_location(p, file$e, 20, 6, 558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(20:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#each $tournaments as tournament}
    function create_each_block$6(ctx) {
    	let current;
    	const tournamentrow_spread_levels = [/*tournament*/ ctx[1]];
    	let tournamentrow_props = {};

    	for (let i = 0; i < tournamentrow_spread_levels.length; i += 1) {
    		tournamentrow_props = assign(tournamentrow_props, tournamentrow_spread_levels[i]);
    	}

    	const tournamentrow = new TournamentRow({
    			props: tournamentrow_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tournamentrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tournamentrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tournamentrow_changes = (dirty & /*$tournaments*/ 1)
    			? get_spread_update(tournamentrow_spread_levels, [get_spread_object(/*tournament*/ ctx[1])])
    			: {};

    			tournamentrow.$set(tournamentrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tournamentrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tournamentrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tournamentrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(18:4) {#each $tournaments as tournament}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div;
    	let current;
    	let each_value = /*$tournaments*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$3(ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Welcome!";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Below are the available tournaments";
    			t3 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(h1, file$e, 14, 2, 364);
    			add_location(p, file$e, 15, 2, 385);
    			attr_dev(div, "class", "tournaments svelte-saxtqp");
    			add_location(div, file$e, 16, 2, 431);
    			attr_dev(main, "class", "svelte-saxtqp");
    			add_location(main, file$e, 13, 0, 354);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(main, t3);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$tournaments*/ 1) {
    				each_value = /*$tournaments*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$3(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $tournaments;
    	validate_store(tournaments, "tournaments");
    	component_subscribe($$self, tournaments, $$value => $$invalidate(0, $tournaments = $$value));

    	onMount(async () => {
    		if (!$tournaments.length) {
    			const res = await fetch("data/tournaments.json");
    			tournaments.set(await res.json());
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tournaments> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tournaments", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		tournaments,
    		TournamentRow,
    		$tournaments
    	});

    	return [$tournaments];
    }

    class Tournaments extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tournaments",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* frontend\App.svelte generated by Svelte v3.23.1 */

    // (32:14) 
    function create_if_block_2$2(ctx) {
    	let current;
    	const tournaments = new Tournaments({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tournaments.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tournaments, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tournaments.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tournaments.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tournaments, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(32:14) ",
    		ctx
    	});

    	return block;
    }

    // (30:23) 
    function create_if_block_1$4(ctx) {
    	let current;

    	const tournament = new Tournament({
    			props: { id: /*tournamentId*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tournament.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tournament, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tournament_changes = {};
    			if (dirty & /*tournamentId*/ 2) tournament_changes.id = /*tournamentId*/ ctx[1];
    			tournament.$set(tournament_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tournament.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tournament.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tournament, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(30:23) ",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#if tournamentId && stageId}
    function create_if_block$5(ctx) {
    	let current;

    	const stage = new Stage({
    			props: {
    				id: /*stageId*/ ctx[2],
    				tournamentId: /*tournamentId*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(stage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stage_changes = {};
    			if (dirty & /*stageId*/ 4) stage_changes.id = /*stageId*/ ctx[2];
    			if (dirty & /*tournamentId*/ 2) stage_changes.tournamentId = /*tournamentId*/ ctx[1];
    			stage.$set(stage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(28:0) {#if tournamentId && stageId}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_if_block_1$4, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tournamentId*/ ctx[1] && /*stageId*/ ctx[2]) return 0;
    		if (/*tournamentId*/ ctx[1]) return 1;
    		if (/*url*/ ctx[0]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let url;
    	let tournamentId;
    	let stageId;

    	const onHashChange = () => {
    		$$invalidate(0, url = location.hash.slice(1) || "/");
    		const [,p1, id1, p2, id2] = url.split("/");
    		$$invalidate(1, tournamentId = p1 === "tournaments" ? id1 : null);
    		$$invalidate(2, stageId = p2 === "stages" ? id2 : null);
    	};

    	onMount(() => {
    		onHashChange();
    		window.addEventListener("hashchange", onHashChange);
    	});

    	onDestroy(() => {
    		window.removeEventListener("hashchange", onHashChange);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		Stage,
    		Tournament,
    		Tournaments,
    		url,
    		tournamentId,
    		stageId,
    		onHashChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("tournamentId" in $$props) $$invalidate(1, tournamentId = $$props.tournamentId);
    		if ("stageId" in $$props) $$invalidate(2, stageId = $$props.stageId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, tournamentId, stageId];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
