package com.ranamahadahmer.ringnet.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object BackendApi {
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://ring-net.vercel.app/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}