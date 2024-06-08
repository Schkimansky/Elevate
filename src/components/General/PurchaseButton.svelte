<script>
    export let width = '110px';
</script>

<main>
    <button style="width: {width};" id="btn">Purchase</button>
</main>

<style>
    #btn {
        color: white;
        background-color: #9e3ffd;
        border-width: 0px;
        height: 37px;

        font-size: 12px;
        border-radius: 20px;

        transition: all 0.3s ease-in-out;
    }
    #btn:hover {
        background-color: #16163f;
    }
</style>