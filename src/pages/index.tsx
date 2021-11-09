import { useEffect, useState, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '~components/atoms/button';
import { ImageFader } from '~components/molecules/image-fader';
import { DefaultLayout } from '~layouts/default';

import { config } from '~config';

import { IMovieData } from '~types';

import {
  getMovies,
  moviesSelector,
  useAppDispatch,
  useAppSelector,
  wrapper,
} from '~store';

type IHomePage = {
  moviesSSR: IMovieData;
};

const Home: NextPage<IHomePage> = ({ moviesSSR }) => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popularity');
  const [sortDirection, setSortDirection] = useState('desc');

  /*
   Dispatch our redux functions or select redux data
   */
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(moviesSelector);

  /*
   Fetch our movies
   */
  const fetchMovies = useCallback(() => {
    const fetchUrl = async () => {
      await dispatch(
        getMovies({
          params: {
            page,
            sort_by: sort + '.' + sortDirection,
          },
        }),
      );
    };
    fetchUrl();
  }, [dispatch, page, sort, sortDirection]);

  /*
   Toggle the sort direction and set the local state
   */
  const toggleDirection = () => {
    if (sortDirection === 'desc') {
      return setSortDirection('asc');
    } else {
      return setSortDirection('desc');
    }
  };

  /*
   Set the page
   */
  const handleSetPage = (num: number) => {
    return setPage(num);
  };

  /*
   Re-fetch data if we update any of our state params
   */
  useEffect(() => {
    return fetchMovies();
  }, [fetchMovies]);

  /*
   Set our data to redux state or fallback to SSR data
   */
  const movies = data?.results || moviesSSR?.results;
  const faderImages = [ movies[2] ]
  console.log('movies', movies);

  return (
    <DefaultLayout>
      <Head>
        <title>Carma Movie DB</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ImageFader data={faderImages} />
      <Button onClick={toggleDirection}>
        {(sortDirection === 'desc' && 'desc') || 'asc'}
      </Button>
      <button onClick={() => handleSetPage(1)}>1</button>
      <button onClick={() => handleSetPage(2)}>2</button>
      <button onClick={() => handleSetPage(3)}>3</button>
      <div onClick={() => setSort('popularity')}>popularity</div>
      <div onClick={() => setSort('release_date')}>release date</div>
      <div onClick={() => setSort('vote_count')}>vote count</div>
      {loading && 'loading...'}
      {error && error}
      {data && data.total_results} results
      {movies &&
        movies.map((movie) => {
          return (
            <div key={movie.id}>
              <h1>
                {movie?.id} {movie?.title}
              </h1>{' '}
              <strong>
                {movie?.vote_count} {movie?.release_date}
              </strong>
              {movie?.poster_path && (
                <Image
                  src={`${config.imagePath}/w500${movie.poster_path}`}
                  alt={movie.title}
                  width={64}
                  height={96}
                />
              )}
            </div>
          );
        })}
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    /* We want the fetch on the server for SEO and page load speed if required. This can be getStaticProps or getServerSideProps */
    /* You can ignore this if it's a backend app behind a login and instead, delete this, then */
    /*
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);
  */
    const req = await store.dispatch(
      getMovies({ params: { page: 1, sort_by: 'popularity.desc' } }),
    );
    const { payload = {} } = req;
    return {
      props: {
        moviesSSR: payload,
      },
    };
  },
);

export default Home;
