
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
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
        const updates = [];
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
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
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
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[96] = list[i].path;
    	child_ctx[97] = list[i].index;
    	child_ctx[98] = list[i].tag;
    	child_ctx[99] = list[i].type;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[96] = list[i].path;
    	child_ctx[97] = list[i].index;
    	child_ctx[98] = list[i].tag;
    	child_ctx[99] = list[i].type;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[96] = list[i].path;
    	child_ctx[97] = list[i].index;
    	child_ctx[98] = list[i].tag;
    	child_ctx[99] = list[i].type;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[96] = list[i].path;
    	child_ctx[97] = list[i].index;
    	child_ctx[98] = list[i].tag;
    	child_ctx[99] = list[i].type;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[96] = list[i].path;
    	child_ctx[97] = list[i].index;
    	child_ctx[98] = list[i].tag;
    	child_ctx[99] = list[i].type;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[96] = list[i].path;
    	child_ctx[97] = list[i].index;
    	child_ctx[98] = list[i].tag;
    	child_ctx[99] = list[i].type;
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	return child_ctx;
    }

    // (381:1) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let div0;
    	let button0;
    	let br0;
    	let t4;
    	let button1;
    	let br1;
    	let t6;
    	let button2;
    	let br2;
    	let t8;
    	let button3;
    	let br3;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value_10 = /*tags*/ ctx[4];
    	validate_each_argument(each_value_10);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Menu";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Back";
    			br0 = element("br");
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Regenerate";
    			br1 = element("br");
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Download Labels";
    			br2 = element("br");
    			t8 = space();
    			button3 = element("button");
    			button3.textContent = "Load Labels";
    			br3 = element("br");
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-yfi6nf");
    			add_location(h2, file, 382, 2, 11173);
    			attr_dev(hr, "class", "svelte-yfi6nf");
    			add_location(hr, file, 383, 2, 11190);
    			attr_dev(button0, "class", "btn btn-sm btn-primary svelte-yfi6nf");
    			add_location(button0, file, 385, 3, 11236);
    			add_location(br0, file, 385, 83, 11316);
    			attr_dev(button1, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button1, file, 386, 3, 11326);
    			add_location(br1, file, 386, 63, 11386);
    			attr_dev(button2, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button2, file, 387, 3, 11396);
    			add_location(br2, file, 387, 94, 11487);
    			attr_dev(button3, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button3, file, 388, 3, 11497);
    			add_location(br3, file, 388, 86, 11580);
    			attr_dev(div0, "class", "btn-group-vertical");
    			add_location(div0, file, 384, 2, 11198);
    			attr_dev(div1, "class", "side-menu svelte-yfi6nf");
    			add_location(div1, file, 381, 1, 11146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, hr);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, br0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, br1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			append_dev(div0, br2);
    			append_dev(div0, t8);
    			append_dev(div0, button3);
    			append_dev(div0, br3);
    			append_dev(div0, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleSideMenu*/ ctx[20], false, false, false, false),
    					listen_dev(button2, "click", /*downloadLabels*/ ctx[11], false, false, false, false),
    					listen_dev(button3, "click", /*loadLabels*/ ctx[12], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tags*/ 16) {
    				each_value_10 = /*tags*/ ctx[4];
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_10(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_10.length;
    			}
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(381:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (377:1) {#if !showSideMenu}
    function create_if_block_11(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Menu";
    			attr_dev(button, "class", "btn btn-primary svelte-yfi6nf");
    			add_location(button, file, 378, 2, 11053);
    			attr_dev(div, "class", "menu svelte-yfi6nf");
    			add_location(div, file, 377, 1, 11031);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleSideMenu*/ ctx[20], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(377:1) {#if !showSideMenu}",
    		ctx
    	});

    	return block;
    }

    // (390:3) {#each tags as tag}
    function create_each_block_10(ctx) {
    	let button;
    	let t_value = /*tag*/ ctx[98] + "";
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 390, 4, 11615);
    			add_location(br, file, 390, 26, 11637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tags*/ 16 && t_value !== (t_value = /*tag*/ ctx[98] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(390:3) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (411:3) {#if type === 'benign'}
    function create_if_block_10(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*index*/ ctx[97] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[29](/*index*/ ctx[97], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			attr_dev(div0, "class", "image-number svelte-yfi6nf");
    			add_location(div0, file, 413, 4, 12527);
    			if (!src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*path*/ ctx[96]);
    			attr_dev(img, "class", "panel-image svelte-yfi6nf");
    			toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'real');
    			add_location(img, file, 414, 4, 12574);
    			attr_dev(div1, "class", "grid-item svelte-yfi6nf");
    			add_location(div1, file, 412, 3, 12498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", click_handler_3, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*realPaths*/ 1 && t0_value !== (t0_value = /*index*/ ctx[97] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*realPaths*/ 1 && !src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*realPaths*/ 1 && img_alt_value !== (img_alt_value = /*path*/ ctx[96])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*selectedIndex, realPaths, selectedPanel*/ 97) {
    				toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'real');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(411:3) {#if type === 'benign'}",
    		ctx
    	});

    	return block;
    }

    // (410:3) {#each realPaths as { path, index, tag, type }
    function create_each_block_9(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*type*/ ctx[99] === 'benign' && create_if_block_10(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[99] === 'benign') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(410:3) {#each realPaths as { path, index, tag, type }",
    		ctx
    	});

    	return block;
    }

    // (427:3) {#if type === 'cancer'}
    function create_if_block_9(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*index*/ ctx[97] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[30](/*index*/ ctx[97], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			attr_dev(div0, "class", "image-number svelte-yfi6nf");
    			add_location(div0, file, 429, 4, 13034);
    			if (!src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*path*/ ctx[96]);
    			attr_dev(img, "class", "panel-image img-rounded svelte-yfi6nf");
    			toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'real');
    			add_location(img, file, 430, 4, 13081);
    			attr_dev(div1, "class", "grid-item svelte-yfi6nf");
    			add_location(div1, file, 428, 3, 13005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", click_handler_4, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*realPaths*/ 1 && t0_value !== (t0_value = /*index*/ ctx[97] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*realPaths*/ 1 && !src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*realPaths*/ 1 && img_alt_value !== (img_alt_value = /*path*/ ctx[96])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*selectedIndex, realPaths, selectedPanel*/ 97) {
    				toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'real');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(427:3) {#if type === 'cancer'}",
    		ctx
    	});

    	return block;
    }

    // (426:3) {#each realPaths as { path, index, tag, type}
    function create_each_block_8(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*type*/ ctx[99] === 'cancer' && create_if_block_9(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[99] === 'cancer') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(426:3) {#each realPaths as { path, index, tag, type}",
    		ctx
    	});

    	return block;
    }

    // (467:3) {#if type === 'benign'}
    function create_if_block_7(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*index*/ ctx[97] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let div1;
    	let t3_value = /*tag*/ ctx[98] + "";
    	let t3;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97] && create_if_block_8(ctx);

    	function click_handler_10(...args) {
    		return /*click_handler_10*/ ctx[38](/*index*/ ctx[97], /*tag*/ ctx[98], ...args);
    	}

    	function dragstart_handler(...args) {
    		return /*dragstart_handler*/ ctx[39](/*index*/ ctx[97], /*tag*/ ctx[98], ...args);
    	}

    	function dragenter_handler(...args) {
    		return /*dragenter_handler*/ ctx[40](/*index*/ ctx[97], ...args);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			attr_dev(div0, "class", "image-number svelte-yfi6nf");
    			add_location(div0, file, 478, 4, 15104);
    			if (!src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*path*/ ctx[96]);
    			attr_dev(img, "class", "panel-image svelte-yfi6nf");
    			toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'generated');
    			toggle_class(img, "tagged", /*tag*/ ctx[98] !== '' && (/*selectedIndex*/ ctx[5] !== /*index*/ ctx[97] || /*selectedPanel*/ ctx[6] !== 'generated'));
    			add_location(img, file, 479, 4, 15151);
    			attr_dev(div1, "class", "tag-text svelte-yfi6nf");
    			add_location(div1, file, 485, 4, 15402);
    			attr_dev(div2, "class", "grid-item svelte-yfi6nf");
    			attr_dev(div2, "draggable", "true");
    			toggle_class(div2, "draggable", !/*dragMode*/ ctx[10]);
    			add_location(div2, file, 469, 3, 14698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", click_handler_10, false, false, false, false),
    					listen_dev(div2, "dragstart", dragstart_handler, false, false, false, false),
    					listen_dev(div2, "dragenter", dragenter_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*generatedPaths*/ 2 && t0_value !== (t0_value = /*index*/ ctx[97] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*generatedPaths*/ 2 && !src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*generatedPaths*/ 2 && img_alt_value !== (img_alt_value = /*path*/ ctx[96])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*selectedIndex, generatedPaths, selectedPanel*/ 98) {
    				toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'generated');
    			}

    			if (dirty[0] & /*generatedPaths, selectedIndex, selectedPanel*/ 98) {
    				toggle_class(img, "tagged", /*tag*/ ctx[98] !== '' && (/*selectedIndex*/ ctx[5] !== /*index*/ ctx[97] || /*selectedPanel*/ ctx[6] !== 'generated'));
    			}

    			if (dirty[0] & /*generatedPaths*/ 2 && t3_value !== (t3_value = /*tag*/ ctx[98] + "")) set_data_dev(t3, t3_value);

    			if (/*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					if_block.m(div2, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*dragMode*/ 1024) {
    				toggle_class(div2, "draggable", !/*dragMode*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(467:3) {#if type === 'benign'}",
    		ctx
    	});

    	return block;
    }

    // (488:4) {#if showTag && selectedIndex === index}
    function create_if_block_8(ctx) {
    	let div;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_7 = /*tags*/ ctx[4];
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Save Tag";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Tag");
    			attr_dev(input, "class", "add-tag");
    			add_location(input, file, 493, 6, 15654);
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 505, 6, 15911);
    			attr_dev(div, "class", "tag-menu svelte-yfi6nf");
    			add_location(div, file, 489, 5, 15492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t0);
    			append_dev(div, input);
    			set_input_value(input, /*selectedTag*/ ctx[3]);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[35]),
    					listen_dev(input, "input", input_handler, false, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[36], false, false, false, false),
    					listen_dev(button, "click", /*click_handler_9*/ ctx[37], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*updateTag, generatedPaths, tags*/ 16402) {
    				each_value_7 = /*tags*/ ctx[4];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}

    			if (dirty[0] & /*selectedTag*/ 8 && input.value !== /*selectedTag*/ ctx[3]) {
    				set_input_value(input, /*selectedTag*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(488:4) {#if showTag && selectedIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (491:6) {#each tags as tag}
    function create_each_block_7(ctx) {
    	let button;
    	let t_value = /*tag*/ ctx[98] + "";
    	let t;
    	let br;
    	let mounted;
    	let dispose;

    	function click_handler_8() {
    		return /*click_handler_8*/ ctx[34](/*index*/ ctx[97], /*tag*/ ctx[98]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 491, 7, 15550);
    			add_location(br, file, 491, 83, 15626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_8, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*tags*/ 16 && t_value !== (t_value = /*tag*/ ctx[98] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(491:6) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (466:3) {#each generatedPaths as { path, index, tag, type }
    function create_each_block_6(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*type*/ ctx[99] === 'benign' && create_if_block_7(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[99] === 'benign') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(466:3) {#each generatedPaths as { path, index, tag, type }",
    		ctx
    	});

    	return block;
    }

    // (531:3) {#if type === 'cancer'}
    function create_if_block_5(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*index*/ ctx[97] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let div1;
    	let t3_value = /*tag*/ ctx[98] + "";
    	let t3;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97] && create_if_block_6(ctx);

    	function click_handler_13(...args) {
    		return /*click_handler_13*/ ctx[45](/*index*/ ctx[97], /*tag*/ ctx[98], ...args);
    	}

    	function dragstart_handler_1(...args) {
    		return /*dragstart_handler_1*/ ctx[46](/*index*/ ctx[97], /*tag*/ ctx[98], ...args);
    	}

    	function dragenter_handler_1(...args) {
    		return /*dragenter_handler_1*/ ctx[47](/*index*/ ctx[97], ...args);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			attr_dev(div0, "class", "image-number svelte-yfi6nf");
    			add_location(div0, file, 542, 4, 17608);
    			if (!src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*path*/ ctx[96]);
    			attr_dev(img, "class", "panel-image svelte-yfi6nf");
    			toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'generated');
    			toggle_class(img, "tagged", /*tag*/ ctx[98] !== '' && (/*selectedIndex*/ ctx[5] !== /*index*/ ctx[97] || /*selectedPanel*/ ctx[6] !== 'generated'));
    			add_location(img, file, 543, 4, 17655);
    			attr_dev(div1, "class", "tag-text svelte-yfi6nf");
    			add_location(div1, file, 549, 4, 17906);
    			attr_dev(div2, "class", "grid-item svelte-yfi6nf");
    			attr_dev(div2, "draggable", "true");
    			toggle_class(div2, "draggable", !/*dragMode*/ ctx[10]);
    			add_location(div2, file, 533, 3, 17202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", click_handler_13, false, false, false, false),
    					listen_dev(div2, "dragstart", dragstart_handler_1, false, false, false, false),
    					listen_dev(div2, "dragenter", dragenter_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*generatedPaths*/ 2 && t0_value !== (t0_value = /*index*/ ctx[97] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*generatedPaths*/ 2 && !src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*generatedPaths*/ 2 && img_alt_value !== (img_alt_value = /*path*/ ctx[96])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*selectedIndex, generatedPaths, selectedPanel*/ 98) {
    				toggle_class(img, "selected", /*selectedIndex*/ ctx[5] == /*index*/ ctx[97] && /*selectedPanel*/ ctx[6] == 'generated');
    			}

    			if (dirty[0] & /*generatedPaths, selectedIndex, selectedPanel*/ 98) {
    				toggle_class(img, "tagged", /*tag*/ ctx[98] !== '' && (/*selectedIndex*/ ctx[5] !== /*index*/ ctx[97] || /*selectedPanel*/ ctx[6] !== 'generated'));
    			}

    			if (dirty[0] & /*generatedPaths*/ 2 && t3_value !== (t3_value = /*tag*/ ctx[98] + "")) set_data_dev(t3, t3_value);

    			if (/*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(div2, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*dragMode*/ 1024) {
    				toggle_class(div2, "draggable", !/*dragMode*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(531:3) {#if type === 'cancer'}",
    		ctx
    	});

    	return block;
    }

    // (552:4) {#if showTag && selectedIndex === index}
    function create_if_block_6(ctx) {
    	let div;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*tags*/ ctx[4];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Save Tag";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Tag");
    			attr_dev(input, "class", "add-tag");
    			add_location(input, file, 557, 6, 18158);
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 569, 6, 18415);
    			attr_dev(div, "class", "tag-menu svelte-yfi6nf");
    			add_location(div, file, 553, 5, 17996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t0);
    			append_dev(div, input);
    			set_input_value(input, /*selectedTag*/ ctx[3]);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[42]),
    					listen_dev(input, "input", input_handler_1, false, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_1*/ ctx[43], false, false, false, false),
    					listen_dev(button, "click", /*click_handler_12*/ ctx[44], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*updateTag, generatedPaths, tags*/ 16402) {
    				each_value_5 = /*tags*/ ctx[4];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*selectedTag*/ 8 && input.value !== /*selectedTag*/ ctx[3]) {
    				set_input_value(input, /*selectedTag*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(552:4) {#if showTag && selectedIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (555:6) {#each tags as tag}
    function create_each_block_5(ctx) {
    	let button;
    	let t_value = /*tag*/ ctx[98] + "";
    	let t;
    	let br;
    	let mounted;
    	let dispose;

    	function click_handler_11() {
    		return /*click_handler_11*/ ctx[41](/*index*/ ctx[97], /*tag*/ ctx[98]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 555, 7, 18054);
    			add_location(br, file, 555, 83, 18130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_11, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*tags*/ 16 && t_value !== (t_value = /*tag*/ ctx[98] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(555:6) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (530:3) {#each generatedPaths as { path, index, tag, type }
    function create_each_block_4(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*type*/ ctx[99] === 'cancer' && create_if_block_5(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[99] === 'cancer') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(530:3) {#each generatedPaths as { path, index, tag, type }",
    		ctx
    	});

    	return block;
    }

    // (579:1) {#if showDiscardPanel}
    function create_if_block(ctx) {
    	let div4;
    	let div1;
    	let h2;
    	let t1;
    	let hr0;
    	let t2;
    	let div0;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let t8;
    	let hr1;
    	let t9;
    	let div2;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t10;
    	let hr2;
    	let t11;
    	let div3;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value_2 = /*fakePaths*/ ctx[8];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*path*/ ctx[96];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value = /*fakePaths*/ ctx[8];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*path*/ ctx[96];
    	validate_each_keys(ctx, each_value, get_each_context, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Fake Images";
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Sort Fake Images by similarity with the selected image";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Shuffle Fake Images";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Reset Images Order";
    			t8 = space();
    			hr1 = element("hr");
    			t9 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			hr2 = element("hr");
    			t11 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "fake-title svelte-yfi6nf");
    			add_location(h2, file, 590, 3, 18909);
    			attr_dev(hr0, "class", "svelte-yfi6nf");
    			add_location(hr0, file, 591, 3, 18953);
    			attr_dev(button0, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button0, file, 594, 4, 19005);
    			attr_dev(button1, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button1, file, 595, 4, 19151);
    			attr_dev(button2, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button2, file, 596, 4, 19265);
    			attr_dev(div0, "class", "btn-group button-bar");
    			add_location(div0, file, 592, 3, 18962);
    			attr_dev(div1, "class", "top-panel svelte-yfi6nf");
    			add_location(div1, file, 589, 2, 18881);
    			attr_dev(hr1, "class", "svelte-yfi6nf");
    			add_location(hr1, file, 599, 2, 19395);
    			attr_dev(div2, "class", "image-grid svelte-yfi6nf");
    			add_location(div2, file, 600, 2, 19403);
    			attr_dev(hr2, "class", "svelte-yfi6nf");
    			add_location(hr2, file, 644, 2, 20620);
    			attr_dev(div3, "class", "image-grid cancer svelte-yfi6nf");
    			add_location(div3, file, 645, 2, 20628);
    			attr_dev(div4, "class", "panel fake-panel svelte-yfi6nf");
    			add_location(div4, file, 579, 1, 18573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, hr0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			append_dev(div4, t8);
    			append_dev(div4, hr1);
    			append_dev(div4, t9);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div2, null);
    				}
    			}

    			append_dev(div4, t10);
    			append_dev(div4, hr2);
    			append_dev(div4, t11);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div3, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_14*/ ctx[50], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_15*/ ctx[51], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_16*/ ctx[52], false, false, false, false),
    					listen_dev(div4, "dragover", /*dragover_handler_1*/ ctx[65], false, false, false, false),
    					listen_dev(div4, "drop", /*drop_handler_1*/ ctx[66], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*handleGenImageClick, fakePaths, handleDragStart, addTag, selectedTag, tags, updateTag, showTag, selectedIndex*/ 4251964) {
    				each_value_2 = /*fakePaths*/ ctx[8];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, div2, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty[0] & /*handleGenImageClick, fakePaths, handleDragStart, addTag, selectedTag, tags, updateTag, showTag, selectedIndex*/ 4251964) {
    				each_value = /*fakePaths*/ ctx[8];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div3, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(579:1) {#if showDiscardPanel}",
    		ctx
    	});

    	return block;
    }

    // (603:3) {#if type === 'benign'}
    function create_if_block_3(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*index*/ ctx[97] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let div1;
    	let t3_value = /*tag*/ ctx[98] + "";
    	let t3;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97] && create_if_block_4(ctx);

    	function click_handler_19(...args) {
    		return /*click_handler_19*/ ctx[57](/*index*/ ctx[97], /*tag*/ ctx[98], ...args);
    	}

    	function dragstart_handler_2(...args) {
    		return /*dragstart_handler_2*/ ctx[58](/*index*/ ctx[97], ...args);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			attr_dev(div0, "class", "image-number svelte-yfi6nf");
    			add_location(div0, file, 613, 4, 19870);
    			if (!src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*path*/ ctx[96]);
    			attr_dev(img, "class", "panel-image svelte-yfi6nf");
    			add_location(img, file, 614, 4, 19917);
    			attr_dev(div1, "class", "tag-text svelte-yfi6nf");
    			add_location(div1, file, 618, 4, 19993);
    			attr_dev(div2, "class", "grid-item svelte-yfi6nf");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file, 607, 3, 19682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", click_handler_19, false, false, false, false),
    					listen_dev(div2, "dragstart", dragstart_handler_2, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*fakePaths*/ 256 && t0_value !== (t0_value = /*index*/ ctx[97] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*fakePaths*/ 256 && !src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*fakePaths*/ 256 && img_alt_value !== (img_alt_value = /*path*/ ctx[96])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*fakePaths*/ 256 && t3_value !== (t3_value = /*tag*/ ctx[98] + "")) set_data_dev(t3, t3_value);

    			if (/*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(div2, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(603:3) {#if type === 'benign'}",
    		ctx
    	});

    	return block;
    }

    // (620:4) {#if showTag && selectedIndex === index}
    function create_if_block_4(ctx) {
    	let div;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*tags*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Save Tag";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Tag");
    			attr_dev(input, "class", "add-tag");
    			add_location(input, file, 625, 6, 20238);
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 637, 6, 20495);
    			attr_dev(div, "class", "tag-menu svelte-yfi6nf");
    			add_location(div, file, 621, 5, 20081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t0);
    			append_dev(div, input);
    			set_input_value(input, /*selectedTag*/ ctx[3]);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_2*/ ctx[54]),
    					listen_dev(input, "input", input_handler_2, false, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_2*/ ctx[55], false, false, false, false),
    					listen_dev(button, "click", /*click_handler_18*/ ctx[56], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*updateTag, fakePaths, tags*/ 16656) {
    				each_value_3 = /*tags*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*selectedTag*/ 8 && input.value !== /*selectedTag*/ ctx[3]) {
    				set_input_value(input, /*selectedTag*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(620:4) {#if showTag && selectedIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (623:6) {#each tags as tag}
    function create_each_block_3(ctx) {
    	let button;
    	let t_value = /*tag*/ ctx[98] + "";
    	let t;
    	let br;
    	let mounted;
    	let dispose;

    	function click_handler_17() {
    		return /*click_handler_17*/ ctx[53](/*index*/ ctx[97], /*tag*/ ctx[98]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 623, 7, 20139);
    			add_location(br, file, 623, 78, 20210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_17, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*tags*/ 16 && t_value !== (t_value = /*tag*/ ctx[98] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(623:6) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (602:3) {#each fakePaths as { path, index, tag, type }
    function create_each_block_2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*type*/ ctx[99] === 'benign' && create_if_block_3(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[99] === 'benign') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(602:3) {#each fakePaths as { path, index, tag, type }",
    		ctx
    	});

    	return block;
    }

    // (648:3) {#if type === 'cancer'}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*index*/ ctx[97] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let div1;
    	let t3_value = /*tag*/ ctx[98] + "";
    	let t3;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97] && create_if_block_2(ctx);

    	function click_handler_22(...args) {
    		return /*click_handler_22*/ ctx[63](/*index*/ ctx[97], /*tag*/ ctx[98], ...args);
    	}

    	function dragstart_handler_3(...args) {
    		return /*dragstart_handler_3*/ ctx[64](/*index*/ ctx[97], ...args);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			attr_dev(div0, "class", "image-number svelte-yfi6nf");
    			add_location(div0, file, 658, 4, 21102);
    			if (!src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*path*/ ctx[96]);
    			attr_dev(img, "class", "panel-image svelte-yfi6nf");
    			add_location(img, file, 659, 4, 21149);
    			attr_dev(div1, "class", "tag-text svelte-yfi6nf");
    			add_location(div1, file, 663, 4, 21225);
    			attr_dev(div2, "class", "grid-item svelte-yfi6nf");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file, 652, 3, 20914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div2, t4);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", click_handler_22, false, false, false, false),
    					listen_dev(div2, "dragstart", dragstart_handler_3, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*fakePaths*/ 256 && t0_value !== (t0_value = /*index*/ ctx[97] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*fakePaths*/ 256 && !src_url_equal(img.src, img_src_value = /*path*/ ctx[96])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*fakePaths*/ 256 && img_alt_value !== (img_alt_value = /*path*/ ctx[96])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*fakePaths*/ 256 && t3_value !== (t3_value = /*tag*/ ctx[98] + "")) set_data_dev(t3, t3_value);

    			if (/*showTag*/ ctx[2] && /*selectedIndex*/ ctx[5] === /*index*/ ctx[97]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div2, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(648:3) {#if type === 'cancer'}",
    		ctx
    	});

    	return block;
    }

    // (665:4) {#if showTag && selectedIndex === index}
    function create_if_block_2(ctx) {
    	let div;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*tags*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Save Tag";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Tag");
    			attr_dev(input, "class", "add-tag");
    			add_location(input, file, 670, 6, 21470);
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 682, 6, 21727);
    			attr_dev(div, "class", "tag-menu svelte-yfi6nf");
    			add_location(div, file, 666, 5, 21313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t0);
    			append_dev(div, input);
    			set_input_value(input, /*selectedTag*/ ctx[3]);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_3*/ ctx[60]),
    					listen_dev(input, "input", input_handler_3, false, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_3*/ ctx[61], false, false, false, false),
    					listen_dev(button, "click", /*click_handler_21*/ ctx[62], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*updateTag, fakePaths, tags*/ 16656) {
    				each_value_1 = /*tags*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*selectedTag*/ 8 && input.value !== /*selectedTag*/ ctx[3]) {
    				set_input_value(input, /*selectedTag*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(665:4) {#if showTag && selectedIndex === index}",
    		ctx
    	});

    	return block;
    }

    // (668:6) {#each tags as tag}
    function create_each_block_1(ctx) {
    	let button;
    	let t_value = /*tag*/ ctx[98] + "";
    	let t;
    	let br;
    	let mounted;
    	let dispose;

    	function click_handler_20() {
    		return /*click_handler_20*/ ctx[59](/*index*/ ctx[97], /*tag*/ ctx[98]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(button, "class", "svelte-yfi6nf");
    			add_location(button, file, 668, 7, 21371);
    			add_location(br, file, 668, 78, 21442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_20, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*tags*/ 16 && t_value !== (t_value = /*tag*/ ctx[98] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(668:6) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (647:3) {#each fakePaths as { path, index, tag, type }
    function create_each_block(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*type*/ ctx[99] === 'cancer' && create_if_block_1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[99] === 'cancer') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(647:3) {#each fakePaths as { path, index, tag, type }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div8;
    	let t0;
    	let div3;
    	let h20;
    	let t2;
    	let hr0;
    	let t3;
    	let div0;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let hr1;
    	let t10;
    	let div1;
    	let each_blocks_3 = [];
    	let each0_lookup = new Map();
    	let t11;
    	let hr2;
    	let t12;
    	let div2;
    	let each_blocks_2 = [];
    	let each1_lookup = new Map();
    	let t13;
    	let div7;
    	let h21;
    	let t15;
    	let hr3;
    	let t16;
    	let div4;
    	let button3;
    	let t18;
    	let button4;
    	let t20;
    	let button5;
    	let t22;
    	let button6;
    	let t24;
    	let hr4;
    	let t25;
    	let div5;
    	let each_blocks_1 = [];
    	let each2_lookup = new Map();
    	let t26;
    	let hr5;
    	let t27;
    	let div6;
    	let each_blocks = [];
    	let each3_lookup = new Map();
    	let t28;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*showSideMenu*/ ctx[7]) return create_if_block_11;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let each_value_9 = /*realPaths*/ ctx[0];
    	validate_each_argument(each_value_9);
    	const get_key = ctx => /*path*/ ctx[96];
    	validate_each_keys(ctx, each_value_9, get_each_context_9, get_key);

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		let child_ctx = get_each_context_9(ctx, each_value_9, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_3[i] = create_each_block_9(key, child_ctx));
    	}

    	let each_value_8 = /*realPaths*/ ctx[0];
    	validate_each_argument(each_value_8);
    	const get_key_1 = ctx => /*path*/ ctx[96];
    	validate_each_keys(ctx, each_value_8, get_each_context_8, get_key_1);

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		let child_ctx = get_each_context_8(ctx, each_value_8, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks_2[i] = create_each_block_8(key, child_ctx));
    	}

    	let each_value_6 = /*generatedPaths*/ ctx[1];
    	validate_each_argument(each_value_6);
    	const get_key_2 = ctx => /*path*/ ctx[96];
    	validate_each_keys(ctx, each_value_6, get_each_context_6, get_key_2);

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		let child_ctx = get_each_context_6(ctx, each_value_6, i);
    		let key = get_key_2(child_ctx);
    		each2_lookup.set(key, each_blocks_1[i] = create_each_block_6(key, child_ctx));
    	}

    	let each_value_4 = /*generatedPaths*/ ctx[1];
    	validate_each_argument(each_value_4);
    	const get_key_3 = ctx => /*path*/ ctx[96];
    	validate_each_keys(ctx, each_value_4, get_each_context_4, get_key_3);

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4(ctx, each_value_4, i);
    		let key = get_key_3(child_ctx);
    		each3_lookup.set(key, each_blocks[i] = create_each_block_4(key, child_ctx));
    	}

    	let if_block1 = /*showDiscardPanel*/ ctx[9] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			if_block0.c();
    			t0 = space();
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Real Images";
    			t2 = space();
    			hr0 = element("hr");
    			t3 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Sort Real Images by similarity with the selected image";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Shuffle Real Images";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Reset Images Order";
    			t9 = space();
    			hr1 = element("hr");
    			t10 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t11 = space();
    			hr2 = element("hr");
    			t12 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t13 = space();
    			div7 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Generated Images";
    			t15 = space();
    			hr3 = element("hr");
    			t16 = space();
    			div4 = element("div");
    			button3 = element("button");
    			button3.textContent = "Sort Generated Images by similarity with the selected image";
    			t18 = space();
    			button4 = element("button");
    			button4.textContent = "Shuffle Generated Images";
    			t20 = space();
    			button5 = element("button");
    			button5.textContent = "Reset Images Order";
    			t22 = space();
    			button6 = element("button");
    			button6.textContent = "Fast tagging mode";
    			t24 = space();
    			hr4 = element("hr");
    			t25 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t26 = space();
    			hr5 = element("hr");
    			t27 = space();
    			div6 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t28 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h20, "class", "top-panel svelte-yfi6nf");
    			add_location(h20, file, 400, 2, 11836);
    			attr_dev(hr0, "class", "svelte-yfi6nf");
    			add_location(hr0, file, 401, 2, 11878);
    			attr_dev(button0, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button0, file, 403, 3, 11936);
    			attr_dev(button1, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button1, file, 404, 3, 12081);
    			attr_dev(button2, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button2, file, 405, 3, 12194);
    			attr_dev(div0, "class", "btn-group button-bar top-panel svelte-yfi6nf");
    			add_location(div0, file, 402, 2, 11886);
    			attr_dev(hr1, "class", "svelte-yfi6nf");
    			add_location(hr1, file, 407, 2, 12313);
    			attr_dev(div1, "class", "image-grid svelte-yfi6nf");
    			add_location(div1, file, 408, 2, 12321);
    			attr_dev(hr2, "class", "svelte-yfi6nf");
    			add_location(hr2, file, 423, 2, 12814);
    			attr_dev(div2, "class", "image-grid cancer svelte-yfi6nf");
    			add_location(div2, file, 424, 2, 12822);
    			attr_dev(div3, "class", "panel container svelte-yfi6nf");
    			add_location(div3, file, 396, 1, 11686);
    			attr_dev(h21, "class", "top-panel svelte-yfi6nf");
    			add_location(h21, file, 453, 2, 13749);
    			attr_dev(hr3, "class", "svelte-yfi6nf");
    			add_location(hr3, file, 454, 2, 13794);
    			attr_dev(button3, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button3, file, 457, 3, 13941);
    			attr_dev(button4, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button4, file, 458, 3, 14096);
    			attr_dev(button5, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			add_location(button5, file, 459, 3, 14219);
    			attr_dev(button6, "class", "btn btn-sm btn-secondary svelte-yfi6nf");
    			toggle_class(button6, "triggered", /*dragMode*/ ctx[10]);
    			add_location(button6, file, 460, 3, 14334);
    			attr_dev(div4, "class", "btn-group button-bar top-panel svelte-yfi6nf");
    			add_location(div4, file, 455, 2, 13802);
    			attr_dev(hr4, "class", "svelte-yfi6nf");
    			add_location(hr4, file, 463, 2, 14470);
    			attr_dev(div5, "class", "image-grid svelte-yfi6nf");
    			add_location(div5, file, 464, 2, 14478);
    			attr_dev(hr5, "class", "svelte-yfi6nf");
    			add_location(hr5, file, 527, 2, 16967);
    			attr_dev(div6, "class", "image-grid cancer svelte-yfi6nf");
    			add_location(div6, file, 528, 2, 16975);
    			attr_dev(div7, "class", "panel svelte-yfi6nf");
    			add_location(div7, file, 441, 1, 13343);
    			attr_dev(div8, "class", "App svelte-yfi6nf");
    			add_location(div8, file, 374, 0, 10987);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			if_block0.m(div8, null);
    			append_dev(div8, t0);
    			append_dev(div8, div3);
    			append_dev(div3, h20);
    			append_dev(div3, t2);
    			append_dev(div3, hr0);
    			append_dev(div3, t3);
    			append_dev(div3, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t5);
    			append_dev(div0, button1);
    			append_dev(div0, t7);
    			append_dev(div0, button2);
    			append_dev(div3, t9);
    			append_dev(div3, hr1);
    			append_dev(div3, t10);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				if (each_blocks_3[i]) {
    					each_blocks_3[i].m(div1, null);
    				}
    			}

    			append_dev(div3, t11);
    			append_dev(div3, hr2);
    			append_dev(div3, t12);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(div2, null);
    				}
    			}

    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, h21);
    			append_dev(div7, t15);
    			append_dev(div7, hr3);
    			append_dev(div7, t16);
    			append_dev(div7, div4);
    			append_dev(div4, button3);
    			append_dev(div4, t18);
    			append_dev(div4, button4);
    			append_dev(div4, t20);
    			append_dev(div4, button5);
    			append_dev(div4, t22);
    			append_dev(div4, button6);
    			append_dev(div7, t24);
    			append_dev(div7, hr4);
    			append_dev(div7, t25);
    			append_dev(div7, div5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div5, null);
    				}
    			}

    			append_dev(div7, t26);
    			append_dev(div7, hr5);
    			append_dev(div7, t27);
    			append_dev(div7, div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div6, null);
    				}
    			}

    			append_dev(div8, t28);
    			if (if_block1) if_block1.m(div8, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[26], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[27], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[28], false, false, false, false),
    					listen_dev(button3, "click", /*click_handler_5*/ ctx[31], false, false, false, false),
    					listen_dev(button4, "click", /*click_handler_6*/ ctx[32], false, false, false, false),
    					listen_dev(button5, "click", /*click_handler_7*/ ctx[33], false, false, false, false),
    					listen_dev(button6, "click", /*switchDragMode*/ ctx[21], false, false, false, false),
    					listen_dev(div7, "drop", /*drop_handler*/ ctx[48], false, false, false, false),
    					listen_dev(div7, "dragover", /*dragover_handler*/ ctx[49], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div8, t0);
    				}
    			}

    			if (dirty[0] & /*realPaths, selectedIndex, selectedPanel, handleRealImageClick*/ 65633) {
    				each_value_9 = /*realPaths*/ ctx[0];
    				validate_each_argument(each_value_9);
    				validate_each_keys(ctx, each_value_9, get_each_context_9, get_key);
    				each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key, 1, ctx, each_value_9, each0_lookup, div1, destroy_block, create_each_block_9, null, get_each_context_9);
    			}

    			if (dirty[0] & /*realPaths, selectedIndex, selectedPanel, handleRealImageClick*/ 65633) {
    				each_value_8 = /*realPaths*/ ctx[0];
    				validate_each_argument(each_value_8);
    				validate_each_keys(ctx, each_value_8, get_each_context_8, get_key_1);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_1, 1, ctx, each_value_8, each1_lookup, div2, destroy_block, create_each_block_8, null, get_each_context_8);
    			}

    			if (dirty[0] & /*dragMode*/ 1024) {
    				toggle_class(button6, "triggered", /*dragMode*/ ctx[10]);
    			}

    			if (dirty[0] & /*dragMode, handleGenImageClick, generatedPaths, handleDragStart, handleDragEnter, addTag, selectedTag, tags, updateTag, showTag, selectedIndex, selectedPanel*/ 12641406) {
    				each_value_6 = /*generatedPaths*/ ctx[1];
    				validate_each_argument(each_value_6);
    				validate_each_keys(ctx, each_value_6, get_each_context_6, get_key_2);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_2, 1, ctx, each_value_6, each2_lookup, div5, destroy_block, create_each_block_6, null, get_each_context_6);
    			}

    			if (dirty[0] & /*dragMode, handleGenImageClick, generatedPaths, handleDragStart, handleDragEnter, addTag, selectedTag, tags, updateTag, showTag, selectedIndex, selectedPanel*/ 12641406) {
    				each_value_4 = /*generatedPaths*/ ctx[1];
    				validate_each_argument(each_value_4);
    				validate_each_keys(ctx, each_value_4, get_each_context_4, get_key_3);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_3, 1, ctx, each_value_4, each3_lookup, div6, destroy_block, create_each_block_4, null, get_each_context_4);
    			}

    			if (/*showDiscardPanel*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div8, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if_block0.d();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].d();
    			}

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    const simPath = 'docs/assets/distances/t10_0.csv';

    // ------------I/O
    const realFolder = 'docs/assets/real_images/';

    const generatedFolder = 'docs/assets/generated_images/';

    function transferItem(index, sourceList, targetList) {
    	// console.log(sourceList.find(images => images.index === index))
    	const indexToTransfer = sourceList.findIndex(images => images.index === index);

    	targetList.push(sourceList[indexToTransfer]);
    	sourceList.splice(indexToTransfer, 1);
    } // const transferredItem = sourceList[index];
    // sourceList = [...sourceList.slice(0, index), ...sourceList.slice(index + 1)];

    function dragOverMove(event) {
    	event.preventDefault();
    }

    const input_handler = () => {
    	
    };

    const input_handler_1 = () => {
    	
    };

    const input_handler_2 = () => {
    	
    };

    const input_handler_3 = () => {
    	
    };

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let mousePosition = { x: 0, y: 0 };
    	let realPaths = [];
    	let generatedPaths = [];
    	const simMatrix = [];

    	const loadRealImages = async () => {
    		const response = await fetch('docs/assets/real_images/manifest.json');
    		const manifest = await response.json();

    		$$invalidate(0, realPaths = manifest.map((fileName, index) => ({
    			path: `${realFolder}${fileName}`,
    			index,
    			tag: '',
    			type: fileName.includes("mel") ? 'cancer' : 'benign'
    		})));
    	};

    	const splitListsCancer = async list => {
    		let cancer = [];
    		let benign = [];

    		list.forEach(image => {
    			if (['mel'].includes(image.path)) {
    				cancer.push(image);
    			} else {
    				benign.push(image);
    			}
    		});

    		return [cancer, benign];
    	};

    	const loadGeneratedImages = async () => {
    		const response = await fetch('docs/assets/generated_images/manifest.json');
    		const manifest = await response.json();

    		$$invalidate(1, generatedPaths = manifest.map((fileName, index) => ({
    			path: `${generatedFolder}${fileName}`,
    			index,
    			tag: '',
    			type: fileName.includes("mel") ? 'cancer' : 'benign'
    		})));
    	};

    	const loadSimMatrix = async () => {
    		try {
    			const csvFilePath = simPath;
    			const response = await fetch(csvFilePath);
    			const csvData = await response.text();
    			const rows = csvData.split('\n');

    			rows.forEach(row => {
    				const values = row.split(', ');
    				const numericValues = values.map(value => parseFloat(value));
    				simMatrix.push(numericValues);
    			});
    		} catch(error) {
    			console.error('Error loading distance matrix:', error);
    		}
    	};

    	const createCsv = () => {
    		loadLabels();

    		let labels = [
    			...generatedPaths,
    			...fakePaths.map(image => ({ ...image, tag: image.tag + ', fake' }))
    		];

    		labels = labels.sort((a, b) => a.index - b.index);
    		const csvContent = labels.map(image => [image.index, image.path, image.tag].join(',')).join('\n');
    		return csvContent;
    	};

    	const downloadLabels = () => {
    		// let labels = [...generatedPaths, ...fakePaths.map((image) => ({...image, tag: image.tag+',fake'}))];
    		// labels = labels.sort((a, b) => a.index - b.index);
    		// const json = JSON.stringify(labels);
    		// const blob = new Blob([json], { type: 'text/json' });
    		const blob = new Blob([createCsv()], { type: 'text/csv' });

    		const url = URL.createObjectURL(blob);
    		const link = document.createElement('a');
    		link.href = url;
    		link.download = 'feedback.csv';
    		link.click();
    		URL.revokeObjectURL(url);
    	};

    	// ------------LOCAL STORAGE
    	const storeLocalStorage = () => {
    		console.log("store");
    		localStorage.setItem('generatedPaths', JSON.stringify(generatedPaths));
    		localStorage.setItem('fakePaths', JSON.stringify(fakePaths));
    	};

    	const loadLabels = () => {
    		console.log("load");
    		const genPathsJSON = localStorage.getItem('generatedPaths');
    		const loadedGen = [];

    		if (genPathsJSON) {
    			const genPathsTemp = JSON.parse(genPathsJSON);

    			genPathsTemp.forEach(image => {
    				loadedGen.push({ ...image, index: parseInt(image.index) });
    			});

    			$$invalidate(1, generatedPaths = loadedGen);
    		}

    		const fakePathsJSON = localStorage.getItem('fakePaths');
    		const loadedFake = [];

    		if (fakePathsJSON) {
    			const fakePathsTemp = JSON.parse(fakePathsJSON);

    			fakePathsTemp.forEach(image => {
    				loadedFake.push({ ...image, index: parseInt(image.index) });
    			});

    			$$invalidate(8, fakePaths = loadedFake);
    		}
    	};

    	// ------------TAGGING
    	let showTag = false;

    	let selectedTag = '';
    	let tags = [];
    	let taggedImages = [];

    	const addTag = () => {
    		//selectedTag contains the text input from the user
    		if (selectedTag) {
    			$$invalidate(4, tags = [...tags, selectedTag]);
    			console.log(tags);
    			$$invalidate(3, selectedTag = '');
    		}
    	};

    	const updateTag = (panel, index, tag) => {
    		if (panel === 'generated') {
    			$$invalidate(1, generatedPaths = generatedPaths.map(image => image.index === index ? { ...image, tag } : image));
    			taggedImages = [...getTagIndexes(generatedPaths)];
    			storeLocalStorage();
    		}
    	};

    	const getTagIndexes = (images, tag) => {
    		//returns the list of indexes of images of tag
    		return images.filter(image => image.tag === tag).map(image => image.index);
    	};

    	const showTagMenu = (event, index) => {
    		mousePosition = { x: event.clientX, y: event.clientY };

    		if (selectedIndex === index) {
    			$$invalidate(2, showTag = true);
    		} else {
    			$$invalidate(2, showTag = true);
    			showMenuGen = false;
    		}

    		$$invalidate(5, selectedIndex = index);
    	};

    	let decisionTree = { isGood: null, category: null };

    	const handleFirstLevelChoice = isGood => {
    		decisionTree.isGood = isGood;
    	};

    	const handleSecondLevelChoice = category => {
    		decisionTree.category = category;
    	};

    	let dragStartIndex = null;
    	let dragTag = '';

    	const dragStartTag = (event, index, tag) => {
    		// event.preventDefault();
    		dragStartIndex = index;

    		dragTag = tag;
    	}; // console.log(dragStartIndex, dragTag, index, tag)

    	const dragEnterTag = (event, index) => {
    		event.preventDefault();

    		if (dragStartIndex !== null) {
    			// console.log(dragStartIndex, dragTag, index)
    			updateTag('generated', index, dragTag);
    		}
    	};

    	const dragDropTag = event => {
    		event.preventDefault();
    		dragStartIndex = null;
    		dragTag = '';
    	};

    	// ------------SELECTION
    	let selectedIndex = null;

    	let selectedPanel = null;

    	const selectImage = (panel, index) => {
    		// changes the selected attribute in the image array
    		$$invalidate(5, selectedIndex = index);

    		$$invalidate(6, selectedPanel = panel);
    	};

    	const handleGenImageClick = (event, index, tag) => {
    		selectImage('generated', index);
    		showTagMenu(event, index);
    	};

    	const handleRealImageClick = (event, index) => {
    		selectImage('real', index);
    	};

    	// ------------SORTING
    	let showMenuGen = false;

    	let showMenuReal = false;

    	const showContextMenu = (event, panel, index) => {
    		event.preventDefault();
    		mousePosition = { x: event.clientX, y: event.clientY };

    		if (selectedIndex === index) {
    			// Clicked on the same image again, toggle menu
    			if (panel === 'real') {
    				showMenuReal = !showMenuReal;
    			} else if (panel === 'generated') {
    				showMenuGen = !showMenuGen;
    			}
    		} else {
    			// Clicked on a different image, show menu for that image
    			showMenuReal = panel === 'real';

    			showMenuGen = panel === 'generated';
    		}

    		$$invalidate(5, selectedIndex = index);
    	};

    	const shuffleImages = panel => {
    		if (panel === 'real') {
    			$$invalidate(0, realPaths = realPaths.sort(() => Math.random() - 0.5));
    		} else if (panel === 'generated') {
    			$$invalidate(1, generatedPaths = generatedPaths.sort(() => Math.random() - 0.5));
    		}
    	};

    	const resetImages = panel => {
    		if (panel === 'real') {
    			$$invalidate(0, realPaths = realPaths.sort((a, b) => a.index - b.index));
    		} else if (panel === 'generated') {
    			$$invalidate(1, generatedPaths = generatedPaths.sort((a, b) => a.index - b.index));
    		}
    	};

    	const sortImages = panel => {
    		const sim = simMatrix[selectedIndex];

    		// console.log(simMatrix[selectedIndex])
    		if (panel === 'real') {
    			$$invalidate(0, realPaths = realPaths.sort((a, b) => sim[a.index] - sim[b.index]));
    		} else if (panel === 'generated') {
    			$$invalidate(1, generatedPaths = generatedPaths.sort((a, b) => sim[b.index] - sim[a.index]));
    		} else {
    			console.log('error: Wrong panel name in sortImages');
    		}
    	};

    	// ------------SIDE MENU
    	let showSideMenu = false;

    	const toggleSideMenu = () => {
    		$$invalidate(7, showSideMenu = !showSideMenu);
    	};

    	// ------------DRAG AND DROP
    	let fakePaths = [];

    	let dragIndex = null;
    	let dragPanel = null;

    	// targetList = [...targetList, transferredItem];
    	function dragStartMove(event, panel, index) {
    		dragIndex = index;
    		dragPanel = panel;
    	} // console.log(dragIndex, dragPanel)

    	function dragDropMove(event, panel) {
    		// console.log(dragIndex, dragPanel, panel)
    		event.preventDefault();

    		if (dragPanel === 'generated' && panel === 'fake') {
    			transferItem(dragIndex, generatedPaths, fakePaths);
    		} else if (panel === 'generated' && dragPanel === 'fake') {
    			transferItem(dragIndex, fakePaths, generatedPaths);
    		}

    		$$invalidate(8, fakePaths); // update in display is by assignment
    		$$invalidate(1, generatedPaths);
    		storeLocalStorage();
    	}

    	//HIDE DISCARD PANEL
    	let showDiscardPanel = true;

    	const hideDiscardPanel = () => {
    		$$invalidate(9, showDiscardPanel = !showDiscardPanel);
    	};

    	//-----------------SWITCH DRAG MODES
    	let dragMode = false;

    	const switchDragMode = () => {
    		$$invalidate(10, dragMode = !dragMode);
    	};

    	const handleDragStart = (event, panel, index, tag) => {
    		if (dragMode) {
    			// console.log('drag start tag')
    			dragStartTag(event, index, tag);
    		} else {
    			// console.log('drag start move')
    			dragStartMove(event, panel, index);
    		}
    	};

    	const handleDragEnter = (event, index) => {
    		if (dragMode) {
    			// console.log('drag enter tag', index)
    			dragEnterTag(event, index);
    		}
    	};

    	const handleDragOver = event => {
    		if (!dragMode) {
    			// console.log('drag over move')
    			dragOverMove(event);
    		}
    	};

    	const handleDrop = (event, panel) => {
    		if (dragMode) {
    			// console.log('drag drop tag')
    			dragDropTag(event);
    		} else {
    			// console.log('drag drop move')
    			dragDropMove(event, panel);
    		}
    	};

    	//-----------------CLICK OUTSIDE MENU
    	const handleClickOutside = event => {
    		// Check if the click event occurred outside the contextual menu
    		const isOutsideMenu = !event.target.closest('.context-menu');

    		const isOutsideTagMenu = !event.target.closest('.grid-item');

    		// If the click event occurred outside the menu, hide the menu
    		if (isOutsideMenu) {
    			showMenuGen = false;
    			showMenuReal = false;
    		}

    		if (isOutsideTagMenu) {
    			$$invalidate(2, showTag = false);
    		}
    	};

    	//-----------------ZOOM
    	// let imageSize = "100px"
    	// const zoomOutButton = () => {
    	// 	imageSize = (imageSize === "100px") ? "20px" : "100px"; // This is your JavaScript variable
    	// };
    	// ------------INIT
    	onMount(async () => {
    		window.addEventListener('click', handleClickOutside);
    		await Promise.all([loadRealImages(), loadGeneratedImages(), loadSimMatrix()]);

    		// Clean up the event listener on component unmount
    		// loadLabels();
    		return () => {
    			window.removeEventListener('click', handleClickOutside);
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => sortImages('real');
    	const click_handler_1 = () => shuffleImages("real");
    	const click_handler_2 = () => resetImages("real");
    	const click_handler_3 = (index, e) => handleRealImageClick(e, index);
    	const click_handler_4 = (index, e) => handleRealImageClick(e, index);
    	const click_handler_5 = () => sortImages('generated');
    	const click_handler_6 = () => shuffleImages("generated");
    	const click_handler_7 = () => resetImages("generated");
    	const click_handler_8 = (index, tag) => updateTag('generated', index, tag);

    	function input_input_handler() {
    		selectedTag = this.value;
    		$$invalidate(3, selectedTag);
    	}

    	const keydown_handler = e => {
    		if (e.key === 'Enter') {
    			addTag();
    		}
    	};

    	const click_handler_9 = () => addTag();
    	const click_handler_10 = (index, tag, e) => handleGenImageClick(e, index);
    	const dragstart_handler = (index, tag, e) => handleDragStart(e, "generated", index, tag);
    	const dragenter_handler = (index, e) => handleDragEnter(e, index);
    	const click_handler_11 = (index, tag) => updateTag('generated', index, tag);

    	function input_input_handler_1() {
    		selectedTag = this.value;
    		$$invalidate(3, selectedTag);
    	}

    	const keydown_handler_1 = e => {
    		if (e.key === 'Enter') {
    			addTag();
    		}
    	};

    	const click_handler_12 = () => addTag();
    	const click_handler_13 = (index, tag, e) => handleGenImageClick(e, index);
    	const dragstart_handler_1 = (index, tag, e) => handleDragStart(e, "generated", index, tag);
    	const dragenter_handler_1 = (index, e) => handleDragEnter(e, index);
    	const drop_handler = e => handleDrop(e, "generated");
    	const dragover_handler = e => handleDragOver(e);
    	const click_handler_14 = () => sortImages('fake');
    	const click_handler_15 = () => shuffleImages("fake");
    	const click_handler_16 = () => resetImages("fake");
    	const click_handler_17 = (index, tag) => updateTag('fake', index, tag);

    	function input_input_handler_2() {
    		selectedTag = this.value;
    		$$invalidate(3, selectedTag);
    	}

    	const keydown_handler_2 = e => {
    		if (e.key === 'Enter') {
    			addTag();
    		}
    	};

    	const click_handler_18 = () => addTag();
    	const click_handler_19 = (index, tag, e) => handleGenImageClick(e, index);
    	const dragstart_handler_2 = (index, e) => handleDragStart(e, "generated", index);
    	const click_handler_20 = (index, tag) => updateTag('fake', index, tag);

    	function input_input_handler_3() {
    		selectedTag = this.value;
    		$$invalidate(3, selectedTag);
    	}

    	const keydown_handler_3 = e => {
    		if (e.key === 'Enter') {
    			addTag();
    		}
    	};

    	const click_handler_21 = () => addTag();
    	const click_handler_22 = (index, tag, e) => handleGenImageClick(e, index);
    	const dragstart_handler_3 = (index, e) => handleDragStart(e, "generated", index);
    	const dragover_handler_1 = e => handleDragOver(e);
    	const drop_handler_1 = e => handleDrop(e, "fake");

    	$$self.$capture_state = () => ({
    		onMount,
    		mousePosition,
    		simPath,
    		realFolder,
    		realPaths,
    		generatedFolder,
    		generatedPaths,
    		simMatrix,
    		loadRealImages,
    		splitListsCancer,
    		loadGeneratedImages,
    		loadSimMatrix,
    		createCsv,
    		downloadLabels,
    		storeLocalStorage,
    		loadLabels,
    		showTag,
    		selectedTag,
    		tags,
    		taggedImages,
    		addTag,
    		updateTag,
    		getTagIndexes,
    		showTagMenu,
    		decisionTree,
    		handleFirstLevelChoice,
    		handleSecondLevelChoice,
    		dragStartIndex,
    		dragTag,
    		dragStartTag,
    		dragEnterTag,
    		dragDropTag,
    		selectedIndex,
    		selectedPanel,
    		selectImage,
    		handleGenImageClick,
    		handleRealImageClick,
    		showMenuGen,
    		showMenuReal,
    		showContextMenu,
    		shuffleImages,
    		resetImages,
    		sortImages,
    		showSideMenu,
    		toggleSideMenu,
    		fakePaths,
    		dragIndex,
    		dragPanel,
    		transferItem,
    		dragStartMove,
    		dragOverMove,
    		dragDropMove,
    		showDiscardPanel,
    		hideDiscardPanel,
    		dragMode,
    		switchDragMode,
    		handleDragStart,
    		handleDragEnter,
    		handleDragOver,
    		handleDrop,
    		handleClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ('mousePosition' in $$props) mousePosition = $$props.mousePosition;
    		if ('realPaths' in $$props) $$invalidate(0, realPaths = $$props.realPaths);
    		if ('generatedPaths' in $$props) $$invalidate(1, generatedPaths = $$props.generatedPaths);
    		if ('showTag' in $$props) $$invalidate(2, showTag = $$props.showTag);
    		if ('selectedTag' in $$props) $$invalidate(3, selectedTag = $$props.selectedTag);
    		if ('tags' in $$props) $$invalidate(4, tags = $$props.tags);
    		if ('taggedImages' in $$props) taggedImages = $$props.taggedImages;
    		if ('decisionTree' in $$props) decisionTree = $$props.decisionTree;
    		if ('dragStartIndex' in $$props) dragStartIndex = $$props.dragStartIndex;
    		if ('dragTag' in $$props) dragTag = $$props.dragTag;
    		if ('selectedIndex' in $$props) $$invalidate(5, selectedIndex = $$props.selectedIndex);
    		if ('selectedPanel' in $$props) $$invalidate(6, selectedPanel = $$props.selectedPanel);
    		if ('showMenuGen' in $$props) showMenuGen = $$props.showMenuGen;
    		if ('showMenuReal' in $$props) showMenuReal = $$props.showMenuReal;
    		if ('showSideMenu' in $$props) $$invalidate(7, showSideMenu = $$props.showSideMenu);
    		if ('fakePaths' in $$props) $$invalidate(8, fakePaths = $$props.fakePaths);
    		if ('dragIndex' in $$props) dragIndex = $$props.dragIndex;
    		if ('dragPanel' in $$props) dragPanel = $$props.dragPanel;
    		if ('showDiscardPanel' in $$props) $$invalidate(9, showDiscardPanel = $$props.showDiscardPanel);
    		if ('dragMode' in $$props) $$invalidate(10, dragMode = $$props.dragMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		realPaths,
    		generatedPaths,
    		showTag,
    		selectedTag,
    		tags,
    		selectedIndex,
    		selectedPanel,
    		showSideMenu,
    		fakePaths,
    		showDiscardPanel,
    		dragMode,
    		downloadLabels,
    		loadLabels,
    		addTag,
    		updateTag,
    		handleGenImageClick,
    		handleRealImageClick,
    		shuffleImages,
    		resetImages,
    		sortImages,
    		toggleSideMenu,
    		switchDragMode,
    		handleDragStart,
    		handleDragEnter,
    		handleDragOver,
    		handleDrop,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		input_input_handler,
    		keydown_handler,
    		click_handler_9,
    		click_handler_10,
    		dragstart_handler,
    		dragenter_handler,
    		click_handler_11,
    		input_input_handler_1,
    		keydown_handler_1,
    		click_handler_12,
    		click_handler_13,
    		dragstart_handler_1,
    		dragenter_handler_1,
    		drop_handler,
    		dragover_handler,
    		click_handler_14,
    		click_handler_15,
    		click_handler_16,
    		click_handler_17,
    		input_input_handler_2,
    		keydown_handler_2,
    		click_handler_18,
    		click_handler_19,
    		dragstart_handler_2,
    		click_handler_20,
    		input_input_handler_3,
    		keydown_handler_3,
    		click_handler_21,
    		click_handler_22,
    		dragstart_handler_3,
    		dragover_handler_1,
    		drop_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
