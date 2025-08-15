<section>
    <h1>Websocket for chat and file streaming</h1>
    <hr>
    <p>For videos it requires ffmpeg conversion to be able to be readen by browsers:</p>
    <code>ffmpeg -i video.mp4 -movflags frag_keyframe+empty_moov+default_base_moof -f mp4 output_frag.mp4</code>
</section>