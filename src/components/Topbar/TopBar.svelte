<script>
    import NavLink from "./NavLink.svelte";
    import PurchaseButton from "../General/PurchaseButton.svelte";
    
    export let on_navlink_click;
    export let globalTab;
</script>

<main>
    <nav id="topbar">
        <nav id="elevate-holder">
            <span id="topbar-elevate" class="purplecolor">Elevate</span>
        </nav>
        <nav id='navlink-holder'>
            <NavLink click={on_navlink_click} globalTab={globalTab} name='Home'/>
            <NavLink click={on_navlink_click} globalTab={globalTab} name='Features'/>
            <NavLink click={on_navlink_click} globalTab={globalTab} name='About'/>
            <NavLink click={on_navlink_click} globalTab={globalTab} name='Plans'/>
            <NavLink click={on_navlink_click} globalTab={globalTab} name='Help'/>
        </nav>
        <nav id="purchasebtn-holder">
            <PurchaseButton width = 100px/>
        </nav>
    </nav>
</main>

<style>
    #elevate-holder {
        padding-right: 80px;
        margin-left: 8px;
    }
    #navlink-holder {
        flex-grow: 1; 
        display: flex; 
        flex-direction: row; 
        justify-content: center; 
        margin-top: 5px;
        gap: 11px;
    }
    #purchasebtn-holder {
        padding-left: 34px; 
        padding-right: 30px; 
        padding-top: 4px;
    }
    #topbar {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 45px;
        width: 100vw;        
        background-color: white; 
        position: fixed; 
        padding-top: 5px;
        top: 0px; 
        left: 0px;
    }
    #topbar-elevate {
        font-size: 20px;
        font-weight: 600;
        margin-left: 20px;
    }
</style>