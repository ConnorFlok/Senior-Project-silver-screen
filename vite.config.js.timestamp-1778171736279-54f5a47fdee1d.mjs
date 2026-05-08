// vite.config.js
import { defineConfig } from "file:///Users/dxg/Desktop/Projects/silver-screen%206/node_modules/vite/dist/node/index.js";
import react from "file:///Users/dxg/Desktop/Projects/silver-screen%206/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning threshold — search_index.json is large but gzips well
    chunkSizeWarningLimit: 3e3,
    rollupOptions: {
      output: {
        // Keep JSON data files as separate chunks so they load lazily
        manualChunks: {
          "search-index": ["./src/data/search_index.json"]
        }
      }
    }
  },
  // Optimise JSON import performance
  json: {
    stringify: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZHhnL0Rlc2t0b3AvUHJvamVjdHMvc2lsdmVyLXNjcmVlbiA2XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZHhnL0Rlc2t0b3AvUHJvamVjdHMvc2lsdmVyLXNjcmVlbiA2L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9keGcvRGVza3RvcC9Qcm9qZWN0cy9zaWx2ZXItc2NyZWVuJTIwNi92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBidWlsZDoge1xuICAgIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyB0aHJlc2hvbGQgXHUyMDE0IHNlYXJjaF9pbmRleC5qc29uIGlzIGxhcmdlIGJ1dCBnemlwcyB3ZWxsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAzMDAwLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBLZWVwIEpTT04gZGF0YSBmaWxlcyBhcyBzZXBhcmF0ZSBjaHVua3Mgc28gdGhleSBsb2FkIGxhemlseVxuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAnc2VhcmNoLWluZGV4JzogWycuL3NyYy9kYXRhL3NlYXJjaF9pbmRleC5qc29uJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIE9wdGltaXNlIEpTT04gaW1wb3J0IHBlcmZvcm1hbmNlXG4gIGpzb246IHtcbiAgICBzdHJpbmdpZnk6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVQsU0FBUyxvQkFBb0I7QUFDbFYsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixPQUFPO0FBQUE7QUFBQSxJQUVMLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLFFBRU4sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsOEJBQThCO0FBQUEsUUFDakQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsTUFBTTtBQUFBLElBQ0osV0FBVztBQUFBLEVBQ2I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
