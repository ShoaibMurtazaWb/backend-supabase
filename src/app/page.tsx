"use client"

import Auth from '@/components/auth'
import TaskManager from '@/components/task-manager'
import React, { useEffect, useState } from 'react'
import { supabase } from './supabase-client'
import { Button } from '@/components/ui/button'

export default function Home() {

  const [session, setSession] = useState<any>(null)
  const fetchSession = async ()=>{
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession.data)
    setSession(currentSession.data.session);

  }
  useEffect(()=>{
    fetchSession()

    const {data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);  
    })
    return ()=>{
      authListener.subscription.unsubscribe()
    }

  }, [])


  const logout = async ()=>{
    const {error} = await supabase.auth.signOut()
    if(error){
      console.log("Error Signing Out: ", error.message)
    }
  } 


  return (
    <div className='h-full flex flex-col flex-1 justify-center items-center gap-20' >

      {session ?
      <>
        <Button onClick={logout}>LogOut</Button>
        <TaskManager session={session}/> 
      </> :
        <Auth />
      }

    </div>
  )
}
