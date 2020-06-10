
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

    /* frontend/components/molecules/ScoreRow.svelte generated by Svelte v3.23.1 */

    const file = "frontend/components/molecules/ScoreRow.svelte";

    function create_fragment(ctx) {
    	let div5;
    	let div0;
    	let a;
    	let t0_value = /*player*/ ctx[0].name + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let div3;
    	let div1;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let t5_value = /*counts*/ ctx[3].max + "";
    	let t5;
    	let t6;
    	let t7_value = /*counts*/ ctx[3][300] + "";
    	let t7;
    	let t8;
    	let t9_value = /*counts*/ ctx[3][200] + "";
    	let t9;
    	let t10;
    	let t11_value = /*counts*/ ctx[3][100] + "";
    	let t11;
    	let t12;
    	let t13_value = /*counts*/ ctx[3][50] + "";
    	let t13;
    	let t14;
    	let t15_value = /*counts*/ ctx[3].miss + "";
    	let t15;
    	let t16;
    	let div4;
    	let t17_value = /*score*/ ctx[1].toLocaleString() + "";
    	let t17;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t2 = text(/*combo*/ ctx[2]);
    			t3 = text(" max combo");
    			t4 = space();
    			div2 = element("div");
    			t5 = text(t5_value);
    			t6 = text(" /\n      ");
    			t7 = text(t7_value);
    			t8 = text(" /\n      ");
    			t9 = text(t9_value);
    			t10 = text(" /\n      ");
    			t11 = text(t11_value);
    			t12 = text(" /\n      ");
    			t13 = text(t13_value);
    			t14 = text(" /\n      ");
    			t15 = text(t15_value);
    			t16 = space();
    			div4 = element("div");
    			t17 = text(t17_value);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 9, 4, 146);
    			attr_dev(div0, "class", "name svelte-13aaa7j");
    			add_location(div0, file, 8, 2, 123);
    			attr_dev(div1, "class", "combo");
    			add_location(div1, file, 14, 4, 276);
    			attr_dev(div2, "class", "counts");
    			add_location(div2, file, 15, 4, 323);
    			attr_dev(div3, "class", "info svelte-13aaa7j");
    			add_location(div3, file, 13, 2, 253);
    			attr_dev(div4, "class", "score svelte-13aaa7j");
    			add_location(div4, file, 24, 2, 494);
    			attr_dev(div5, "class", "root svelte-13aaa7j");
    			add_location(div5, file, 7, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, a);
    			append_dev(a, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    			append_dev(div2, t7);
    			append_dev(div2, t8);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div2, t11);
    			append_dev(div2, t12);
    			append_dev(div2, t13);
    			append_dev(div2, t14);
    			append_dev(div2, t15);
    			append_dev(div5, t16);
    			append_dev(div5, div4);
    			append_dev(div4, t17);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*player*/ 1 && t0_value !== (t0_value = /*player*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*player*/ 1 && a_href_value !== (a_href_value = `https://osu.ppy.sh/users/${/*player*/ ctx[0].id}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*combo*/ 4) set_data_dev(t2, /*combo*/ ctx[2]);
    			if (dirty & /*counts*/ 8 && t5_value !== (t5_value = /*counts*/ ctx[3].max + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*counts*/ 8 && t7_value !== (t7_value = /*counts*/ ctx[3][300] + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*counts*/ 8 && t9_value !== (t9_value = /*counts*/ ctx[3][200] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*counts*/ 8 && t11_value !== (t11_value = /*counts*/ ctx[3][100] + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*counts*/ 8 && t13_value !== (t13_value = /*counts*/ ctx[3][50] + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*counts*/ 8 && t15_value !== (t15_value = /*counts*/ ctx[3].miss + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*score*/ 2 && t17_value !== (t17_value = /*score*/ ctx[1].toLocaleString() + "")) set_data_dev(t17, t17_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
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
    	let { player } = $$props;
    	let { score } = $$props;
    	let { combo } = $$props;
    	let { counts } = $$props;
    	const writable_props = ["player", "score", "combo", "counts"];

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
    	};

    	$$self.$capture_state = () => ({ player, score, combo, counts });

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("score" in $$props) $$invalidate(1, score = $$props.score);
    		if ("combo" in $$props) $$invalidate(2, combo = $$props.combo);
    		if ("counts" in $$props) $$invalidate(3, counts = $$props.counts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, score, combo, counts];
    }

    class ScoreRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { player: 0, score: 1, combo: 2, counts: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreRow",
    			options,
    			id: create_fragment.name
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
    }

    /* frontend/components/organisms/ScoreList.svelte generated by Svelte v3.23.1 */
    const file$1 = "frontend/components/organisms/ScoreList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (15:2) {#if displayScores}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*scores*/ ctx[1];
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

    			attr_dev(div, "class", "scores svelte-phg5ss");
    			add_location(div, file$1, 15, 4, 350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players, scores*/ 3) {
    				each_value = /*scores*/ ctx[1];
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
    		source: "(15:2) {#if displayScores}",
    		ctx
    	});

    	return block;
    }

    // (18:8) {#if players[score.userId]}
    function create_if_block_1(ctx) {
    	let current;

    	const scorerow_spread_levels = [
    		{
    			player: /*players*/ ctx[0][/*score*/ ctx[4].userId]
    		},
    		/*score*/ ctx[4]
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
    			const scorerow_changes = (dirty & /*players, scores*/ 3)
    			? get_spread_update(scorerow_spread_levels, [
    					{
    						player: /*players*/ ctx[0][/*score*/ ctx[4].userId]
    					},
    					dirty & /*scores*/ 2 && get_spread_object(/*score*/ ctx[4])
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:8) {#if players[score.userId]}",
    		ctx
    	});

    	return block;
    }

    // (17:6) {#each scores as score}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*players*/ ctx[0][/*score*/ ctx[4].userId] && create_if_block_1(ctx);

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
    			if (/*players*/ ctx[0][/*score*/ ctx[4].userId]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*players, scores*/ 3) {
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
    		source: "(17:6) {#each scores as score}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let button;
    	let t0_value = (/*displayScores*/ ctx[2] ? "Hide" : "Show") + "";
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*displayScores*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = text(" all scores");
    			t2 = space();
    			if (if_block) if_block.c();
    			add_location(button, file$1, 13, 2, 238);
    			attr_dev(div, "class", "root");
    			add_location(div, file$1, 12, 0, 217);
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
    			if ((!current || dirty & /*displayScores*/ 4) && t0_value !== (t0_value = (/*displayScores*/ ctx[2] ? "Hide" : "Show") + "")) set_data_dev(t0, t0_value);

    			if (/*displayScores*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*displayScores*/ 4) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { players } = $$props;
    	let { scores } = $$props;
    	let displayScores = false;

    	function handleToggle() {
    		$$invalidate(2, displayScores = !displayScores);
    	}

    	const writable_props = ["players", "scores"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScoreList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScoreList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    		if ("scores" in $$props) $$invalidate(1, scores = $$props.scores);
    	};

    	$$self.$capture_state = () => ({
    		ScoreRow,
    		players,
    		scores,
    		displayScores,
    		handleToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    		if ("scores" in $$props) $$invalidate(1, scores = $$props.scores);
    		if ("displayScores" in $$props) $$invalidate(2, displayScores = $$props.displayScores);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [players, scores, displayScores, handleToggle];
    }

    class ScoreList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { players: 0, scores: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreList",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[0] === undefined && !("players" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'players'");
    		}

    		if (/*scores*/ ctx[1] === undefined && !("scores" in props)) {
    			console.warn("<ScoreList> was created without expected prop 'scores'");
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
    }

    /* frontend/components/molecules/MapCard.svelte generated by Svelte v3.23.1 */

    const file$2 = "frontend/components/molecules/MapCard.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(div0, file$2, 16, 6, 382);
    			attr_dev(div1, "class", "name svelte-14fulyi");
    			attr_dev(div1, "title", /*title*/ ctx[0]);
    			add_location(div1, file$2, 17, 6, 423);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/beatmapsets/${/*beatmapSetId*/ ctx[5]}#mania/${/*beatmapId*/ ctx[4]}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 15, 4, 281);
    			add_location(b0, file$2, 20, 6, 509);
    			add_location(br0, file$2, 20, 27, 530);
    			add_location(b1, file$2, 20, 48, 551);
    			attr_dev(div2, "class", "mapper");
    			add_location(div2, file$2, 19, 4, 482);
    			attr_dev(div3, "class", "metrics svelte-14fulyi");
    			add_location(div3, file$2, 22, 4, 582);
    			attr_dev(div4, "class", "title svelte-14fulyi");
    			add_location(div4, file$2, 14, 2, 257);
    			attr_dev(div5, "class", "category svelte-14fulyi");
    			add_location(div5, file$2, 26, 2, 649);
    			add_location(br1, file$2, 28, 30, 741);
    			add_location(br2, file$2, 28, 85, 796);
    			add_location(br3, file$2, 29, 27, 830);
    			add_location(br4, file$2, 30, 25, 862);
    			add_location(br5, file$2, 31, 33, 902);
    			add_location(br6, file$2, 32, 29, 938);
    			add_location(br7, file$2, 33, 29, 974);
    			attr_dev(div6, "class", "counts svelte-14fulyi");
    			add_location(div6, file$2, 27, 2, 690);
    			attr_dev(div7, "class", "root svelte-14fulyi");
    			add_location(div7, file$2, 13, 0, 236);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
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
    			id: create_fragment$2.name
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

    /* frontend/pages/Stage.svelte generated by Svelte v3.23.1 */
    const file$3 = "frontend/pages/Stage.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading tournament data...";
    			add_location(p, file$3, 43, 4, 1171);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (31:2) {#if $stage}
    function create_if_block$1(ctx) {
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let h1;
    	let t2_value = /*$stage*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let h2;
    	let t4_value = /*$stage*/ ctx[2].maps.length + "";
    	let t4;
    	let t5;
    	let t6;
    	let div;
    	let current;
    	let each_value = /*$stage*/ ctx[2].maps;
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
    			a = element("a");
    			t0 = text("< Back");
    			t1 = space();
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			h2 = element("h2");
    			t4 = text(t4_value);
    			t5 = text(" maps");
    			t6 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "href", a_href_value = `#/tournaments/${/*tournamentId*/ ctx[0]}`);
    			add_location(a, file$3, 31, 4, 803);
    			add_location(h1, file$3, 32, 4, 868);
    			add_location(h2, file$3, 33, 4, 895);
    			attr_dev(div, "class", "maps");
    			add_location(div, file$3, 34, 4, 934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t4);
    			append_dev(h2, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*tournamentId*/ 1 && a_href_value !== (a_href_value = `#/tournaments/${/*tournamentId*/ ctx[0]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*$stage*/ 4) && t2_value !== (t2_value = /*$stage*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$stage*/ 4) && t4_value !== (t4_value = /*$stage*/ ctx[2].maps.length + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$tournament, $stage*/ 6) {
    				each_value = /*$stage*/ ctx[2].maps;
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
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(31:2) {#if $stage}",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#each $stage.maps as map}
    function create_each_block$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const mapcard_spread_levels = [/*map*/ ctx[4]];
    	let mapcard_props = {};

    	for (let i = 0; i < mapcard_spread_levels.length; i += 1) {
    		mapcard_props = assign(mapcard_props, mapcard_spread_levels[i]);
    	}

    	const mapcard = new MapCard({ props: mapcard_props, $$inline: true });

    	const scorelist = new ScoreList({
    			props: {
    				players: /*$tournament*/ ctx[1].players,
    				scores: /*map*/ ctx[4].scores
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mapcard.$$.fragment);
    			t0 = space();
    			create_component(scorelist.$$.fragment);
    			t1 = space();
    			attr_dev(div, "class", "map svelte-1uwsjf2");
    			add_location(div, file$3, 36, 8, 994);
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
    			const mapcard_changes = (dirty & /*$stage*/ 4)
    			? get_spread_update(mapcard_spread_levels, [get_spread_object(/*map*/ ctx[4])])
    			: {};

    			mapcard.$set(mapcard_changes);
    			const scorelist_changes = {};
    			if (dirty & /*$tournament*/ 2) scorelist_changes.players = /*$tournament*/ ctx[1].players;
    			if (dirty & /*$stage*/ 4) scorelist_changes.scores = /*map*/ ctx[4].scores;
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:6) {#each $stage.maps as map}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$stage*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-1uwsjf2");
    			add_location(main, file$3, 29, 0, 777);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $tournament;
    	let $stage;
    	validate_store(tournament, "tournament");
    	component_subscribe($$self, tournament, $$value => $$invalidate(1, $tournament = $$value));
    	validate_store(stage, "stage");
    	component_subscribe($$self, stage, $$value => $$invalidate(2, $stage = $$value));
    	let { id } = $$props;
    	let { tournamentId } = $$props;

    	onMount(async () => {
    		if (!$tournament || $tournament.id != id) {
    			try {
    				const res = await fetch(`data/${tournamentId}.json`);
    				tournament.set(await res.json());
    			} catch {
    				location.hash = "";
    			}
    		}

    		if (!$stage || $stage.id != id) {
    			try {
    				const res = await fetch(`data/${tournamentId}.${id}.json`);
    				stage.set(await res.json());
    			} catch {
    				location.hash = `#/tournaments/${tournamentId}`;
    			}
    		}
    	});

    	const writable_props = ["id", "tournamentId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stage", $$slots, []);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("tournamentId" in $$props) $$invalidate(0, tournamentId = $$props.tournamentId);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tournament,
    		stage,
    		ScoreList,
    		MapCard,
    		id,
    		tournamentId,
    		$tournament,
    		$stage
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("tournamentId" in $$props) $$invalidate(0, tournamentId = $$props.tournamentId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tournamentId, $tournament, $stage, id];
    }

    class Stage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 3, tournamentId: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stage",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
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

    /* frontend/components/molecules/StageRow.svelte generated by Svelte v3.23.1 */

    const file$4 = "frontend/components/molecules/StageRow.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(a, file$4, 8, 4, 125);
    			attr_dev(div0, "class", "name svelte-b5fgg6");
    			add_location(div0, file$4, 7, 2, 102);
    			attr_dev(div1, "class", "maps svelte-b5fgg6");
    			add_location(div1, file$4, 12, 2, 174);
    			attr_dev(div2, "class", "root svelte-b5fgg6");
    			add_location(div2, file$4, 6, 0, 81);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, mapCount: 1, href: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StageRow",
    			options,
    			id: create_fragment$4.name
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

    /* frontend/components/molecules/PlayerRow.svelte generated by Svelte v3.23.1 */

    const file$5 = "frontend/components/molecules/PlayerRow.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(img, file$5, 12, 4, 207);
    			attr_dev(div0, "class", "avatar svelte-ot3nx9");
    			add_location(div0, file$5, 11, 2, 182);
    			attr_dev(a, "href", a_href_value = `https://osu.ppy.sh/users/${/*id*/ ctx[0]}`);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 15, 4, 269);
    			attr_dev(div1, "class", "name svelte-ot3nx9");
    			add_location(div1, file$5, 14, 2, 246);
    			add_location(br, file$5, 20, 21, 402);
    			attr_dev(div2, "class", "info svelte-ot3nx9");
    			add_location(div2, file$5, 19, 2, 362);
    			attr_dev(div3, "class", "root svelte-ot3nx9");
    			add_location(div3, file$5, 10, 0, 161);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
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
    			id: create_fragment$5.name
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

    /* frontend/pages/Tournament.svelte generated by Svelte v3.23.1 */

    const { Object: Object_1 } = globals;
    const file$6 = "frontend/pages/Tournament.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (37:2) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading tournament data...";
    			add_location(p, file$6, 37, 4, 1029);
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
    		source: "(37:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:2) {#if $tournament}
    function create_if_block$2(ctx) {
    	let a;
    	let t1;
    	let h1;
    	let t2_value = /*$tournament*/ ctx[1].name + "";
    	let t2;
    	let t3;
    	let h20;
    	let t4_value = /*$tournament*/ ctx[1].stages.length + "";
    	let t4;
    	let t5;
    	let t6;
    	let div0;
    	let t7;
    	let h21;
    	let t8_value = Object.keys(/*$tournament*/ ctx[1].players).length + "";
    	let t8;
    	let t9;
    	let t10;
    	let div1;
    	let current;
    	let each_value_1 = /*$tournament*/ ctx[1].stages;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = Object.values(/*$tournament*/ ctx[1].players);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "< Back";
    			t1 = space();
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			h20 = element("h2");
    			t4 = text(t4_value);
    			t5 = text(" stages");
    			t6 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			h21 = element("h2");
    			t8 = text(t8_value);
    			t9 = text(" players");
    			t10 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "href", "#/");
    			add_location(a, file$6, 22, 4, 524);
    			add_location(h1, file$6, 23, 4, 560);
    			add_location(h20, file$6, 24, 4, 592);
    			attr_dev(div0, "class", "stages svelte-11u6ss8");
    			add_location(div0, file$6, 25, 4, 640);
    			add_location(h21, file$6, 30, 4, 812);
    			attr_dev(div1, "class", "players");
    			add_location(div1, file$6, 31, 4, 875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t4);
    			append_dev(h20, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t7, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t8);
    			append_dev(h21, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$tournament*/ 2) && t2_value !== (t2_value = /*$tournament*/ ctx[1].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$tournament*/ 2) && t4_value !== (t4_value = /*$tournament*/ ctx[1].stages.length + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$tournament, id*/ 3) {
    				each_value_1 = /*$tournament*/ ctx[1].stages;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*$tournament*/ 2) && t8_value !== (t8_value = Object.keys(/*$tournament*/ ctx[1].players).length + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*Object, $tournament*/ 2) {
    				each_value = Object.values(/*$tournament*/ ctx[1].players);
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
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(22:2) {#if $tournament}",
    		ctx
    	});

    	return block;
    }

    // (27:6) {#each $tournament.stages as stage}
    function create_each_block_1(ctx) {
    	let current;

    	const stagerow_spread_levels = [
    		/*stage*/ ctx[5],
    		{
    			href: `#/tournaments/${/*id*/ ctx[0]}/stages/${/*stage*/ ctx[5].id}`
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
    			const stagerow_changes = (dirty & /*$tournament, id*/ 3)
    			? get_spread_update(stagerow_spread_levels, [
    					dirty & /*$tournament*/ 2 && get_spread_object(/*stage*/ ctx[5]),
    					{
    						href: `#/tournaments/${/*id*/ ctx[0]}/stages/${/*stage*/ ctx[5].id}`
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(27:6) {#each $tournament.stages as stage}",
    		ctx
    	});

    	return block;
    }

    // (33:6) {#each Object.values($tournament.players) as player}
    function create_each_block$2(ctx) {
    	let current;
    	const playerrow_spread_levels = [/*player*/ ctx[2]];
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
    			const playerrow_changes = (dirty & /*Object, $tournament*/ 2)
    			? get_spread_update(playerrow_spread_levels, [get_spread_object(/*player*/ ctx[2])])
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(33:6) {#each Object.values($tournament.players) as player}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$tournament*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-11u6ss8");
    			add_location(main, file$6, 20, 0, 493);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $tournament;
    	validate_store(tournament, "tournament");
    	component_subscribe($$self, tournament, $$value => $$invalidate(1, $tournament = $$value));
    	let { id } = $$props;

    	onMount(async () => {
    		if (!$tournament || $tournament.id != id) {
    			try {
    				const res = await fetch(`data/${id}.json`);
    				tournament.set(await res.json());
    			} catch {
    				location.hash = "";
    			}
    		}
    	});

    	const writable_props = ["id"];

    	Object_1.keys($$props).forEach(key => {
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
    		StageRow,
    		PlayerRow,
    		id,
    		$tournament
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, $tournament];
    }

    class Tournament extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tournament",
    			options,
    			id: create_fragment$6.name
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

    /* frontend/components/molecules/TournamentRow.svelte generated by Svelte v3.23.1 */

    const file$7 = "frontend/components/molecules/TournamentRow.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(a, file$7, 8, 4, 127);
    			attr_dev(div0, "class", "name svelte-1lh8f59");
    			add_location(div0, file$7, 7, 2, 104);
    			attr_dev(div1, "class", "players svelte-1lh8f59");
    			add_location(div1, file$7, 12, 2, 193);
    			attr_dev(div2, "class", "root svelte-1lh8f59");
    			add_location(div2, file$7, 6, 0, 83);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 0, id: 1, playersCount: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TournamentRow",
    			options,
    			id: create_fragment$7.name
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

    /* frontend/pages/Tournaments.svelte generated by Svelte v3.23.1 */
    const file$8 = "frontend/pages/Tournaments.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (20:4) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading tournaments...";
    			add_location(p, file$8, 20, 6, 538);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(20:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#each $tournaments as tournament}
    function create_each_block$3(ctx) {
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(18:4) {#each $tournaments as tournament}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
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
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$2(ctx);
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

    			add_location(h1, file$8, 14, 2, 350);
    			add_location(p, file$8, 15, 2, 370);
    			attr_dev(div, "class", "tournaments svelte-saxtqp");
    			add_location(div, file$8, 16, 2, 415);
    			attr_dev(main, "class", "svelte-saxtqp");
    			add_location(main, file$8, 13, 0, 341);
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    					each_1_else = create_else_block$2(ctx);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tournaments",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* frontend/App.svelte generated by Svelte v3.23.1 */

    // (32:14) 
    function create_if_block_2(ctx) {
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(32:14) ",
    		ctx
    	});

    	return block;
    }

    // (30:23) 
    function create_if_block_1$1(ctx) {
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(30:23) ",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#if tournamentId && stageId}
    function create_if_block$3(ctx) {
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(28:0) {#if tournamentId && stageId}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$1, create_if_block_2];
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
