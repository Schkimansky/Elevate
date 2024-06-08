<script>
    import TopBar from "./components/Topbar/TopBar.svelte";
    import Home from "./components/MainPages/Home/Home.svelte";
    
    let globalTab = 'Home';
    function on_navlink_click(name) { globalTab = name; };
</script>

<main style="position: absolute; left: -10px; width: 100%;">
    <TopBar on_navlink_click={on_navlink_click} globalTab={globalTab}/>

    <nav id="home">
        <Home/>
    </nav>
</main>

<style>
    #home {
        background-color: transparent;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 101.2073%;
        display: flex;
        flex-direction: column;
        z-index: -1000;
    }
</style>