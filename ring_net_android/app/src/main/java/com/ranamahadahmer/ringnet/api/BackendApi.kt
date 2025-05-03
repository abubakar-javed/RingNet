package com.ranamahadahmer.ringnet.api

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object BackendApi {
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://ring-net.vercel.app/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .client(
            OkHttpClient.Builder()
                .connectTimeout(30L, TimeUnit.SECONDS)
                .readTimeout(30L, TimeUnit.SECONDS)
                .writeTimeout(30L, TimeUnit.SECONDS)
                .build()
        )
        .build()
}

