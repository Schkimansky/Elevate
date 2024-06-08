
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    let outros;
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
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
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

    /* src/components/Topbar/NavLink.svelte generated by Svelte v3.59.2 */

    const file$6 = "src/components/Topbar/NavLink.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(button, "class", "topbar-navlink svelte-i4rr3a");
    			toggle_class(button, "selected", /*globalTab*/ ctx[2] == /*name*/ ctx[0]);
    			add_location(button, file$6, 7, 4, 100);
    			add_location(main, file$6, 6, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*click*/ ctx[1](/*name*/ ctx[0]))) /*click*/ ctx[1](/*name*/ ctx[0]).apply(this, arguments);
    					},
    					false,
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);

    			if (dirty & /*globalTab, name*/ 5) {
    				toggle_class(button, "selected", /*globalTab*/ ctx[2] == /*name*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavLink', slots, []);
    	let { name } = $$props;
    	let { click } = $$props;
    	let { globalTab } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<NavLink> was created without expected prop 'name'");
    		}

    		if (click === undefined && !('click' in $$props || $$self.$$.bound[$$self.$$.props['click']])) {
    			console.warn("<NavLink> was created without expected prop 'click'");
    		}

    		if (globalTab === undefined && !('globalTab' in $$props || $$self.$$.bound[$$self.$$.props['globalTab']])) {
    			console.warn("<NavLink> was created without expected prop 'globalTab'");
    		}
    	});

    	const writable_props = ['name', 'click', 'globalTab'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('click' in $$props) $$invalidate(1, click = $$props.click);
    		if ('globalTab' in $$props) $$invalidate(2, globalTab = $$props.globalTab);
    	};

    	$$self.$capture_state = () => ({ name, click, globalTab });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('click' in $$props) $$invalidate(1, click = $$props.click);
    		if ('globalTab' in $$props) $$invalidate(2, globalTab = $$props.globalTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, click, globalTab];
    }

    class NavLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 0, click: 1, globalTab: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLink",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get name() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get click() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set click(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get globalTab() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set globalTab(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/General/PurchaseButton.svelte generated by Svelte v3.59.2 */

    const file$5 = "src/components/General/PurchaseButton.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let button;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			t = text("Purchase");
    			set_style(button, "width", /*width*/ ctx[0]);
    			attr_dev(button, "id", "btn");
    			attr_dev(button, "class", "svelte-1j9qvmz");
    			add_location(button, file$5, 5, 4, 63);
    			add_location(main, file$5, 4, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 1) {
    				set_style(button, "width", /*width*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PurchaseButton', slots, []);
    	let { width = '110px' } = $$props;
    	const writable_props = ['width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PurchaseButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ width });

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width];
    }

    class PurchaseButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PurchaseButton",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get width() {
    		throw new Error("<PurchaseButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<PurchaseButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Topbar/TopBar.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/components/Topbar/TopBar.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let nav3;
    	let nav0;
    	let span;
    	let t1;
    	let nav1;
    	let navlink0;
    	let t2;
    	let navlink1;
    	let t3;
    	let navlink2;
    	let t4;
    	let navlink3;
    	let t5;
    	let navlink4;
    	let t6;
    	let nav2;
    	let purchasebutton;
    	let current;

    	navlink0 = new NavLink({
    			props: {
    				click: /*on_navlink_click*/ ctx[0],
    				globalTab: /*globalTab*/ ctx[1],
    				name: "Home"
    			},
    			$$inline: true
    		});

    	navlink1 = new NavLink({
    			props: {
    				click: /*on_navlink_click*/ ctx[0],
    				globalTab: /*globalTab*/ ctx[1],
    				name: "Features"
    			},
    			$$inline: true
    		});

    	navlink2 = new NavLink({
    			props: {
    				click: /*on_navlink_click*/ ctx[0],
    				globalTab: /*globalTab*/ ctx[1],
    				name: "About"
    			},
    			$$inline: true
    		});

    	navlink3 = new NavLink({
    			props: {
    				click: /*on_navlink_click*/ ctx[0],
    				globalTab: /*globalTab*/ ctx[1],
    				name: "Plans"
    			},
    			$$inline: true
    		});

    	navlink4 = new NavLink({
    			props: {
    				click: /*on_navlink_click*/ ctx[0],
    				globalTab: /*globalTab*/ ctx[1],
    				name: "Help"
    			},
    			$$inline: true
    		});

    	purchasebutton = new PurchaseButton({
    			props: { width: "100px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav3 = element("nav");
    			nav0 = element("nav");
    			span = element("span");
    			span.textContent = "Elevate";
    			t1 = space();
    			nav1 = element("nav");
    			create_component(navlink0.$$.fragment);
    			t2 = space();
    			create_component(navlink1.$$.fragment);
    			t3 = space();
    			create_component(navlink2.$$.fragment);
    			t4 = space();
    			create_component(navlink3.$$.fragment);
    			t5 = space();
    			create_component(navlink4.$$.fragment);
    			t6 = space();
    			nav2 = element("nav");
    			create_component(purchasebutton.$$.fragment);
    			attr_dev(span, "id", "topbar-elevate");
    			attr_dev(span, "class", "purplecolor svelte-pq30hs");
    			add_location(span, file$4, 11, 12, 270);
    			attr_dev(nav0, "id", "elevate-holder");
    			attr_dev(nav0, "class", "svelte-pq30hs");
    			add_location(nav0, file$4, 10, 8, 232);
    			attr_dev(nav1, "id", "navlink-holder");
    			attr_dev(nav1, "class", "svelte-pq30hs");
    			add_location(nav1, file$4, 13, 8, 354);
    			attr_dev(nav2, "id", "purchasebtn-holder");
    			attr_dev(nav2, "class", "svelte-pq30hs");
    			add_location(nav2, file$4, 20, 8, 819);
    			attr_dev(nav3, "id", "topbar");
    			attr_dev(nav3, "class", "svelte-pq30hs");
    			add_location(nav3, file$4, 9, 4, 206);
    			add_location(main, file$4, 8, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav3);
    			append_dev(nav3, nav0);
    			append_dev(nav0, span);
    			append_dev(nav3, t1);
    			append_dev(nav3, nav1);
    			mount_component(navlink0, nav1, null);
    			append_dev(nav1, t2);
    			mount_component(navlink1, nav1, null);
    			append_dev(nav1, t3);
    			mount_component(navlink2, nav1, null);
    			append_dev(nav1, t4);
    			mount_component(navlink3, nav1, null);
    			append_dev(nav1, t5);
    			mount_component(navlink4, nav1, null);
    			append_dev(nav3, t6);
    			append_dev(nav3, nav2);
    			mount_component(purchasebutton, nav2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navlink0_changes = {};
    			if (dirty & /*on_navlink_click*/ 1) navlink0_changes.click = /*on_navlink_click*/ ctx[0];
    			if (dirty & /*globalTab*/ 2) navlink0_changes.globalTab = /*globalTab*/ ctx[1];
    			navlink0.$set(navlink0_changes);
    			const navlink1_changes = {};
    			if (dirty & /*on_navlink_click*/ 1) navlink1_changes.click = /*on_navlink_click*/ ctx[0];
    			if (dirty & /*globalTab*/ 2) navlink1_changes.globalTab = /*globalTab*/ ctx[1];
    			navlink1.$set(navlink1_changes);
    			const navlink2_changes = {};
    			if (dirty & /*on_navlink_click*/ 1) navlink2_changes.click = /*on_navlink_click*/ ctx[0];
    			if (dirty & /*globalTab*/ 2) navlink2_changes.globalTab = /*globalTab*/ ctx[1];
    			navlink2.$set(navlink2_changes);
    			const navlink3_changes = {};
    			if (dirty & /*on_navlink_click*/ 1) navlink3_changes.click = /*on_navlink_click*/ ctx[0];
    			if (dirty & /*globalTab*/ 2) navlink3_changes.globalTab = /*globalTab*/ ctx[1];
    			navlink3.$set(navlink3_changes);
    			const navlink4_changes = {};
    			if (dirty & /*on_navlink_click*/ 1) navlink4_changes.click = /*on_navlink_click*/ ctx[0];
    			if (dirty & /*globalTab*/ 2) navlink4_changes.globalTab = /*globalTab*/ ctx[1];
    			navlink4.$set(navlink4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlink0.$$.fragment, local);
    			transition_in(navlink1.$$.fragment, local);
    			transition_in(navlink2.$$.fragment, local);
    			transition_in(navlink3.$$.fragment, local);
    			transition_in(navlink4.$$.fragment, local);
    			transition_in(purchasebutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navlink0.$$.fragment, local);
    			transition_out(navlink1.$$.fragment, local);
    			transition_out(navlink2.$$.fragment, local);
    			transition_out(navlink3.$$.fragment, local);
    			transition_out(navlink4.$$.fragment, local);
    			transition_out(purchasebutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navlink0);
    			destroy_component(navlink1);
    			destroy_component(navlink2);
    			destroy_component(navlink3);
    			destroy_component(navlink4);
    			destroy_component(purchasebutton);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopBar', slots, []);
    	let { on_navlink_click } = $$props;
    	let { globalTab } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (on_navlink_click === undefined && !('on_navlink_click' in $$props || $$self.$$.bound[$$self.$$.props['on_navlink_click']])) {
    			console.warn("<TopBar> was created without expected prop 'on_navlink_click'");
    		}

    		if (globalTab === undefined && !('globalTab' in $$props || $$self.$$.bound[$$self.$$.props['globalTab']])) {
    			console.warn("<TopBar> was created without expected prop 'globalTab'");
    		}
    	});

    	const writable_props = ['on_navlink_click', 'globalTab'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('on_navlink_click' in $$props) $$invalidate(0, on_navlink_click = $$props.on_navlink_click);
    		if ('globalTab' in $$props) $$invalidate(1, globalTab = $$props.globalTab);
    	};

    	$$self.$capture_state = () => ({
    		NavLink,
    		PurchaseButton,
    		on_navlink_click,
    		globalTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('on_navlink_click' in $$props) $$invalidate(0, on_navlink_click = $$props.on_navlink_click);
    		if ('globalTab' in $$props) $$invalidate(1, globalTab = $$props.globalTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [on_navlink_click, globalTab];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { on_navlink_click: 0, globalTab: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get on_navlink_click() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set on_navlink_click(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get globalTab() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set globalTab(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MainPages/Home/PageOne.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/components/MainPages/Home/PageOne.svelte";

    function create_fragment$3(ctx) {
    	let nav2;
    	let nav1;
    	let span0;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let span1;
    	let t4;
    	let nav0;
    	let purchasebutton;
    	let t5;
    	let img;
    	let img_src_value;
    	let current;
    	purchasebutton = new PurchaseButton({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav2 = element("nav");
    			nav1 = element("nav");
    			span0 = element("span");
    			t0 = text("Welcome to");
    			br = element("br");
    			t1 = text("ElevateHost");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = `${info}`;
    			t4 = space();
    			nav0 = element("nav");
    			create_component(purchasebutton.$$.fragment);
    			t5 = space();
    			img = element("img");
    			add_location(br, file$3, 8, 55, 386);
    			attr_dev(span0, "class", "big-header purplecolor");
    			add_location(span0, file$3, 8, 8, 339);
    			attr_dev(span1, "class", "small-header purplecolor");
    			set_style(span1, "width", "320px");
    			set_style(span1, "line-height", "27px");
    			add_location(span1, file$3, 10, 8, 422);
    			set_style(nav0, "margin-top", "14px");
    			add_location(nav0, file$3, 12, 8, 529);
    			attr_dev(nav1, "id", "header-box");
    			attr_dev(nav1, "class", "svelte-rfbbdq");
    			add_location(nav1, file$3, 7, 4, 309);
    			attr_dev(img, "id", "fillimage");
    			if (!src_url_equal(img.src, img_src_value = "res/cloud1.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", ".");
    			attr_dev(img, "class", "svelte-rfbbdq");
    			add_location(img, file$3, 17, 4, 625);
    			attr_dev(nav2, "id", "page1-holder");
    			attr_dev(nav2, "class", "svelte-rfbbdq");
    			add_location(nav2, file$3, 6, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav2, anchor);
    			append_dev(nav2, nav1);
    			append_dev(nav1, span0);
    			append_dev(span0, t0);
    			append_dev(span0, br);
    			append_dev(span0, t1);
    			append_dev(nav1, t2);
    			append_dev(nav1, span1);
    			append_dev(nav1, t4);
    			append_dev(nav1, nav0);
    			mount_component(purchasebutton, nav0, null);
    			append_dev(nav2, t5);
    			append_dev(nav2, img);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(purchasebutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(purchasebutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav2);
    			destroy_component(purchasebutton);
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

    const info = "ElevateHost is your reliable high-speed Minecraft hosting solution. With our dedicated servers and our Free 1TB+ DDOS protection, You will be gaining players in no time.";

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PageOne', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PageOne> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ PurchaseButton, info });
    	return [];
    }

    class PageOne extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageOne",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/MainPages/Home/PageTwo.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/MainPages/Home/PageTwo.svelte";

    function create_fragment$2(ctx) {
    	let nav2;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let nav1;
    	let nav0;

    	const block = {
    		c: function create() {
    			nav2 = element("nav");
    			span0 = element("span");
    			span0.textContent = "Our Features";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = `${info1}`;
    			t3 = space();
    			nav1 = element("nav");
    			nav0 = element("nav");
    			attr_dev(span0, "id", "features-top-header");
    			attr_dev(span0, "class", "pageinfo-header svelte-1q3h92w");
    			add_location(span0, file$2, 5, 4, 109);
    			attr_dev(span1, "id", "features-middle-header");
    			attr_dev(span1, "class", "normal-header purplecolor svelte-1q3h92w");
    			add_location(span1, file$2, 6, 4, 188);
    			attr_dev(nav0, "id", "single-feature-holder");
    			attr_dev(nav0, "class", "svelte-1q3h92w");
    			add_location(nav0, file$2, 9, 8, 309);
    			attr_dev(nav1, "id", "features-list");
    			attr_dev(nav1, "class", "svelte-1q3h92w");
    			add_location(nav1, file$2, 8, 4, 276);
    			attr_dev(nav2, "id", "page2-holder");
    			attr_dev(nav2, "class", "svelte-1q3h92w");
    			add_location(nav2, file$2, 4, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav2, anchor);
    			append_dev(nav2, span0);
    			append_dev(nav2, t1);
    			append_dev(nav2, span1);
    			append_dev(nav2, t3);
    			append_dev(nav2, nav1);
    			append_dev(nav1, nav0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav2);
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

    const info1 = "Empowering your server with Elevate Host";

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PageTwo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PageTwo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ info1 });
    	return [];
    }

    class PageTwo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageTwo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/MainPages/Home/Home.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/components/MainPages/Home/Home.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let pageone;
    	let t;
    	let pagetwo;
    	let current;
    	pageone = new PageOne({ $$inline: true });
    	pagetwo = new PageTwo({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(pageone.$$.fragment);
    			t = space();
    			create_component(pagetwo.$$.fragment);
    			attr_dev(main, "id", "home");
    			attr_dev(main, "class", "svelte-17q57ap");
    			add_location(main, file$1, 5, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(pageone, main, null);
    			append_dev(main, t);
    			mount_component(pagetwo, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pageone.$$.fragment, local);
    			transition_in(pagetwo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pageone.$$.fragment, local);
    			transition_out(pagetwo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(pageone);
    			destroy_component(pagetwo);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ PageOne, PageTwo });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let topbar;
    	let t;
    	let nav;
    	let home;
    	let current;

    	topbar = new TopBar({
    			props: {
    				on_navlink_click: /*on_navlink_click*/ ctx[1],
    				globalTab: /*globalTab*/ ctx[0]
    			},
    			$$inline: true
    		});

    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(topbar.$$.fragment);
    			t = space();
    			nav = element("nav");
    			create_component(home.$$.fragment);
    			attr_dev(nav, "id", "home");
    			attr_dev(nav, "class", "svelte-xa9v2j");
    			add_location(nav, file, 11, 4, 374);
    			set_style(main, "position", "absolute");
    			set_style(main, "left", "-10px");
    			set_style(main, "width", "100%");
    			add_location(main, file, 8, 0, 236);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(topbar, main, null);
    			append_dev(main, t);
    			append_dev(main, nav);
    			mount_component(home, nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topbar_changes = {};
    			if (dirty & /*globalTab*/ 1) topbar_changes.globalTab = /*globalTab*/ ctx[0];
    			topbar.$set(topbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(topbar);
    			destroy_component(home);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let globalTab = 'Home';

    	function on_navlink_click(name) {
    		$$invalidate(0, globalTab = name);
    	}
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TopBar,
    		Home,
    		globalTab,
    		on_navlink_click
    	});

    	$$self.$inject_state = $$props => {
    		if ('globalTab' in $$props) $$invalidate(0, globalTab = $$props.globalTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [globalTab, on_navlink_click];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

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
    	props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
