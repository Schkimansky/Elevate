<script>
    export let name;
    export let click;
    export let globalTab;
</script>

<main>
    <button on:click={click(name)} class:selected={globalTab == name} class="topbar-navlink">{name}</button>
</main>

<style>
    .topbar-navlink {
        background-color: transparent;
        border-color: transparent;
        font-size: 13px;
        font-weight: 300;
        color: #16163f;
        transition: 0.2s all ease-in-out;
        background-color: transparent;
    }
    .topbar-navlink::after {
        color: #9e3ffd;
        background-color: #00000012;
    }
    .topbar-navlink:hover {
        color: #9e3ffd;
        background-color: #00000012;
    }
    .selected {
        color: #9e3ffd !important;
        background-color: #00000012;
    } 
</style>