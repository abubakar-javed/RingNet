package com.ranamahadahmer.ringnet.api.auth

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object AuthBackendApi {
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://ring-net.vercel.app/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}

