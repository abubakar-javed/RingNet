package com.ranamahadahmer.ringnet.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object AuthBackendApi {
    val retrofit: Retrofit = Retrofit.Builder()
            .baseUrl("https://backend-henna-gamma.vercel.app/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
}