<script>
    const info1 = "Empowering your server with Elevate Host"
</script>

<nav id="page2-holder">
    <span id='features-top-header' class="pageinfo-header">Our Features</span>
    <span id='features-middle-header' class="normal-header purplecolor">{info1}</span>

    <nav id="features-list">
        <nav id='single-feature-holder'>

        </nav>
    </nav>
</nav>

<style>
    #page2-holder {
        /* FlexBox */
        display: flex;
        flex-direction: column;

        align-items: center;
        justify-content: start;

        /* Width */
        width: 100%;
        height: 100vh;

        background-color: white;
    }
    #single-feature-holder {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    #features-list {
        width: 100%;
        height: fit-content;
    }
    #features-top-header { 
        margin-top: 35px;
    }
    #features-middle-header { 
        margin-top: 15px; 
        font-size: 30px; 
        width: 350px;
        text-align: center;
    }
</style>