import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import client from "../../../../prisma/prisma";

export async function POST(request) {
  const id = parseInt(request.url.slice(request.url.lastIndexOf('/') + 1));

  const user_token = cookies().get('next-auth.session-token');

  const userid = user_token? await client.Session.findUnique({
    where: {
      sessionToken: user_token.value,
    },
    select: {
      userId: true,
      expires: true
    },
  }) : null;

  console.log(userid);
  if (!user_token || !userid || !userid.userId) {
    return NextResponse.json({
      message: "유효하지 않은 토큰입니다."
    }, {
      status: 401,
    });
  }
  
  if(isNaN(id)) {
    return NextResponse.json({
      parameter: "id",
      message: "int 형식이 아닌 ID 값입니다."
    }, {
      status: 400,
    });
  }

  const club = await client.clubList.findUnique({
    where: {
      id,
    },
  });

  if (!club) {
    return new Response(null, {
      status: 204,
    });
  }

  const leader = await client.JoinedClub.findUnique({
    where: {
      userId_clubId: {
        userId: userid.userId,
        clubId: id
      }
    },
    select: {
      isLeader: true
    }
  });

  if (!leader || !leader.isLeader) {
    return NextResponse.json({
      message: "등록 권한이 없는 클라이언트입니다."
    }, {
      status: 403,
    });
  }

  const { start, end, url, people, title, content, image } = await request.json();

  const params = { start, end, url, people, title, content };
  for(const param in params) {
    console.log(param);
    if (!params[param]) {
      return NextResponse.json({
        parameter: param,
        message: "올바르지 않은 parameter입니다."
      }, {
        status: 400,
      });
    }
  }

  await client.Post.create({
    data: {
      userId: userid.userId,
      clubId: id,
      title,
      content,
      isRecruit: true,
      recruit: {
        create: {
          recruitStart: start,
          recruitEnd: end,
          recruitURL: url,
          recruitTarget: JSON.stringify(people),
        }
      },
      image: {
        connectOrCreate: image.map((img) => {
          return {
            where: {
              filename: img
            },
            create: {
              filename: img
            }
          };
        }),
      },
    },
  })

  return new Response(null, {
    status: 201,
  });
}