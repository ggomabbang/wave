'use client'

import DongariInList from '../find/DongariInList';
import Styles from './my.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function My() {
  const router = useRouter();
  const [User, setUser] = useState({
    email: '로딩 중', 
    username: '로딩 중', 
    emailConfirm: null
  });
  const [Groups, setGroups] = useState([]);

  const [clubFix, setClubFix] = useState(false);

  const GetMyinfo = async () => {
    const URL = 'http://localhost:3000';
    const rows = await fetch(URL+'/api/users/my', {
      method: "GET"
    });
    const jsonData = await rows.json();
    setUser(jsonData);
  }

  const GetMyClubs = async () => {
    const URL = 'http://localhost:3000';
    const rows = await fetch(URL+'/api/clubs/my', {
      method: "GET"
    });
    const jsonData = await rows.json();
    setGroups(jsonData);
  }

  const emailHandler = async (e) => {
    const emailURL = 'http://localhost:3000/api/auth/email';
    const emailRes = await fetch(emailURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: User.email
      })
    });
    if (emailRes.status == 204) {
      alert(`${User.email}로 전송된 메일을 통해 이메일 인증을 진행해주세요.`)
      return router.push('/');
    } else if (emailRes.status == 400) {
      alert('MY 페이지에서 이메일 확인을 다시 진행해주세요');
      return router.push('/');
    } else {
      alert('Error');
      return router.push('/');
    }
  }

  useEffect(() => {
    GetMyClubs();
    GetMyinfo();
  }, [])

  return (
    <div className={Styles.Content}>
      <div className={Styles.InputPanel}>

        <div className={Styles.HorizonBox}>
          <p className={Styles.Left}>이름</p>
          <div className={Styles.Right}>
            <input 
            value={User.username}
            className={Styles.InputBox} 
            readOnly
            id='name_box'
            />
          </div>
        </div>

        <div className={Styles.HorizonBox}>
          <p className={Styles.Left}>이메일</p>
          <div className={Styles.Right}>
            <input 
            value={User.email}
            className={Styles.InputBox} 
            readOnly
            id='name_box'
            />
          </div>
        </div>

        <div className={Styles.HorizonBox}>
          <p className={Styles.Left}></p>
          <div className={Styles.Right}>
            <ul>
              {
                User.emailConfirm ? 
                  <li id={Styles.email_check}>인증된 이메일 ✅</li> :
                  <li id={Styles.email_uncheck}>인증되지 않은 이메일 ❌</li>
              }
            </ul>
            {
              User.emailConfirm ?
                null :
                <button className={Styles.BlueButton} onClick={emailHandler}>이메일 인증하기</button>
            }
          </div>
        </div>

        <div className={Styles.HorizonBox}>
          <p className={Styles.Left}>비밀번호</p>
          <div className={Styles.Right}>
            <Link href={'/my/password'}>
              <button className={Styles.BlueButton}>
                비밀번호 변경하기
              </button>
            </Link>
          </div>
        </div>

      </div>

      <div className={Styles.DongariPanel}>
        <div className={Styles.Top}>
          <h1 className={Styles.Title}>관리중인 동아리 🔧</h1>
        </div>
        <div className={Styles.ListBox}>
          {
            Groups.map((club,index)=>{
              return(
                <div className={Styles.ClubRow}>
                  <Link 
                    className={Styles.ClubFix}
                    style={clubFix ? null :
                      {display: 'none'}
                    }
                    href={`/my/club/${club.id}`}
                  >
                    관리
                  </Link>
                  <DongariInList
                    club={club}
                    i={index} 
                    key={club.id}
                  />
                </div>
              );
            })
          }
        </div>
        <div className={Styles.ButtonSpace}>
          {
            Groups.length ?
            <button
              className={Styles.BlueButton}
              onClick={(e) => {
                setClubFix(!clubFix);
              }}
              style={clubFix ? 
                {backgroundColor: 'gray'} : null
              }
            >
              {
                clubFix ? '취소' : '관리하기'
              }
            </button>
            :
            <button
              className={Styles.BlueButton}
              style={{backgroundColor: 'gray'}}
            >
              현재 관리 중인 동아리가 없습니다.
            </button>
          }
          
        </div>
      </div>
      
      {/* <div className={Styles.DongariPanel}>
        <div className={Styles.Top}>
          <h1 className={Styles.Title}>소속된 동아리 📌</h1>
        </div>
        <div className={Styles.ListBox}>

        </div>
      </div> */}
    </div>
  )
}