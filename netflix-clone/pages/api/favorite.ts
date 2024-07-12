import { NextApiRequest, NextApiResponse } from "next";
import { without } from "lodash";

import prismadb from "@/lib/prismabd";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      console.log("hit1");
      const { currentUser } = await serverAuth(req, res);
      const { movieId } = req.body;
      console.log("hit2");

      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId,
        },
      });

      console.log("hit3");

      if (!existingMovie) {
        throw new Error("Invalid Id");
      }
      console.log("hit4");

      const user = await prismadb.user.update({
        where: {
          email: currentUser.email || "",
        },
        data: {
          favoriteIds: {
            push: movieId,
          },
        },
      });
      console.log("hit5");

      return res.status(200).json(user);
    }

    if (req.method === "DELETE") {
      const { currentUser } = await serverAuth(req, res);

      const { movieId } = req.body;

      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId,
        },
      });

      if (!existingMovie) {
        throw new Error("Invalid id");
      }

      const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);

      const updatedUser = await prismadb.user.update({
        where: {
          email: currentUser.email || "",
        },
        data: {
          favoriteIds: updatedFavoriteIds,
        },
      });

      return res.status(200).json(updatedUser);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);

    return res.status(400).end();
  }
}
