<script>
    import PurchaseButton from "../../General/PurchaseButton.svelte";

    const info = "ElevateHost is your reliable high-speed Minecraft hosting solution. With our dedicated servers and our Free 1TB+ DDOS protection, You will be gaining players in no time.";
</script>

<nav id="page1-holder">
    <nav id="header-box">
        <span class="big-header purplecolor">Welcome to<br>ElevateHost</span>
    
        <span class="small-header purplecolor" style="width: 320px; line-height: 27px;">{info}</span>
    
        <nav style='margin-top: 14px'>
            <PurchaseButton/>
        </nav>
    </nav>    

    <img id='fillimage' src="res/cloud1.jpg" alt=".">
</nav>

<style>
    #page1-holder {
        display: flex;
        width: 100%;
        height: 100vh;
        background-color: white;
        justify-content: space-between;
    }
    #fillimage {
        height: 83%;
        width: auto;
        margin-right: 3%;
        margin-top: 5%;
    }
    #header-box {
        display: flex;
        margin-top: 100px;
        flex-direction: column;
        gap: 10px;
        margin-left: 93px; 
        width: fit-content;
    }
</style>