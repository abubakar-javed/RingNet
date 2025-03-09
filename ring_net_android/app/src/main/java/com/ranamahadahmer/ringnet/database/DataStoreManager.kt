package com.ranamahadahmer.ringnet.database


import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// At the top level of your kotlin file:
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_data")


class DataStoreManager(private val context: Context) {

    companion object {
        val TOKEN = stringPreferencesKey("token")
        val KEY = stringPreferencesKey("key")
        val USER_ID = stringPreferencesKey("userId")
    }

    suspend fun insertData(data: Map<String, String>) {
        context.dataStore.edit {
            it[TOKEN] = data["token"]!!
            it[USER_ID] = data["userId"]!!
        }
    }
    suspend fun insertKey(key:  String) {
        context.dataStore.edit {
            it[TOKEN] = key
        }

    }
    val key: Flow<String?> = context.dataStore.data
            .map { preferences ->
                preferences[KEY]
            }
    val token: Flow<String?> = context.dataStore.data
            .map { preferences ->
                preferences[TOKEN]
            }

    val userId: Flow<String?> = context.dataStore.data
            .map { preferences ->
                preferences[USER_ID]
            }


}