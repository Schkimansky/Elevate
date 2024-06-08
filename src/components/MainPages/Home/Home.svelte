<script>
    import PageOne from "./PageOne.svelte";
    import PageTwo from "./PageTwo.svelte";
</script>

<main id="home">
    <PageOne/>
    <PageTwo/>
</main>

<style>
    #home {
        display: flex;
        flex-direction: column;
    }
</style>